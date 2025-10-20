<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cookie;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{   

    public function register(Request $request){
       
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()){
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        return response()->json(['message' => 'User Successfully Registered', 'user' => $user],201);

    }

    public function login(Request $request){
         $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()){
            return response()->json($validator->errors(), 422);
        }

        $user = User::where('email',$request->email)->first();

        if(!$user || !Hash::check($request->password, $user->password)){
            return response()->json(['message' => 'Invalid Credentials'], 401);
        }

        // Delete any existing tokens for cleanup
        $user->tokens()->delete();

        // 1. Create short-lived Access Token (uses sanctum.expiration from config)
        $accessToken = $user->createToken('access_token',['*'], Carbon::now()->addMinutes(config('sanctum.expiration')))->plainTextToken;
        
        // 2. Create long-lived Refresh Token (7 days)
        $refreshToken = $user->createToken('refresh_token',['*'], Carbon::now()->addDays(7))->plainTextToken;

        // Return Access Token in body and Refresh Token in an HttpOnly cookie
        return response()->json([
            'message' => 'Token Granted',
            'access_token'=> $accessToken,
            'user' => $user,
            ])->cookie('refresh_token',$refreshToken,60*24*7, '/', null, false, true, false, 'lax'); 
            // Note: Cookie lifetime is set to 7 days (60*24*7) to match token expiration
    }

    public function logout(Request $request){
        // Delete all tokens for the user
        $request-> user()->tokens()->delete();

        // Clear the refresh token cookie
        return response()->json(['messege' => ' User Logged Out Successfully'])->withoutCookie('refresh_token');
    }

    public function refreshToken(Request $request)
    {
        $refreshTokenFromCookie = $request->cookie('refresh_token');
        
        if (!$refreshTokenFromCookie) {
            return response()->json(['message' => 'Refresh token not found.'], 401);
        }

        if (strpos($refreshTokenFromCookie, '|') === false) {
            return response()->json(['message' => 'Invalid refresh token format.'], 401);
        }

        list($tokenId, $token) = explode('|', $refreshTokenFromCookie, 2);
        $tokenData = PersonalAccessToken::find($tokenId);

        // Security check: Verify token existence, hash match, and token name
        if ( !$tokenData || !hash_equals($tokenData->token, hash('sha256', $token)) || $tokenData->name !== 'refresh_token'){
            return response()->json(['message' => 'Invalid refresh token.'], 401);
        }
        
        // CHECK FIX: Check if the refresh token is older than 7 days (its intended lifespan)
        // If the token is too old, delete it and force re-login.
        if ($tokenData->created_at->addDays(7)->isPast()) { 
            $tokenData->delete();
            return response()->json(['message' => 'Refresh token expired. Please log in again.'], 401);
        }
        
        $user = $tokenData->tokenable;
        
        // Revoke the old Access Token to maintain a single active token
        $user->tokens()->where('name', 'access_token')->delete();

        // Generate a brand new Access Token with the configured short expiry time
        $newAccessToken = $user->createToken('access_token', ['*'], Carbon::now()->addMinutes(config('sanctum.expiration')))->plainTextToken;

        return response()->json([
            'access_token' => $newAccessToken,
        ]);
    }
}
