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

        $user->tokens()->delete();

        $accessToken = $user->createToken('access_token',['*'], Carbon::now()->addMinutes(config('sanctum.expiration')))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token',['*'], Carbon::now()->addDays(7))->plainTextToken;

        return response()->json([
            'message' => 'Token Granted',
            'access_token'=> $accessToken,
            'user' => $user,
            ])->cookie('refresh_token',$refreshToken,60*24);
    }

    public function logout(Request $request){
        $request-> user()->tokens()->delete();

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

        if ( !$tokenData || !hash_equals($tokenData->token, hash('sha256', $token)) || $tokenData->name !== 'refresh_token'){
            return response()->json(['message' => 'Invalid refresh token.'], 401);
        }
        
        if ($tokenData->created_at->addDays(1)->isPast()) {
            $tokenData->delete();
            return response()->json(['message' => 'Refresh token expired.'], 401);
        }
        
        $user = $tokenData->tokenable;
        $user->tokens()->where('name', 'access_token')->delete();

        $newAccessToken = $user->createToken('access_token', ['*'], Carbon::now()->addMinutes(config('sanctum.expiration')))->plainTextToken;

        return response()->json([
            'access_token' => $newAccessToken,
        ]);
    }
}
