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
use Illuminate\Support\Facades\Log; 

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

        Log::info('Login Successful. Refresh Token set as cookie.'); 
        
        return response()->json([
            'message' => 'Token Granted',
            'access_token'=> $accessToken,
            'user' => $user,
            ])->cookie('refresh_token',$refreshToken,60*24*7, '/', null, false, true, false, 'lax'); 
    }

    public function logout(Request $request){
        $request-> user()->tokens()->delete();
        return response()->json(['messege' => ' User Logged Out Successfully'])->withoutCookie('refresh_token');
    }

    public function refreshToken(Request $request)
    {
        Log::info('--- REFRESH TOKEN ATTEMPT STARTED ---'); 
        $refreshTokenFromCookie = $request->cookie('refresh_token');
        Log::info('Refresh Token from Cookie:', ['token_presence' => (bool)$refreshTokenFromCookie, 'token_value_start' => substr($refreshTokenFromCookie, 0, 30)]);
        if (!$refreshTokenFromCookie) {
            Log::warning('Refresh token not found in cookie.');
            return response()->json(['message' => 'Refresh token not found.'], 401);
        }

        if (strpos($refreshTokenFromCookie, '|') === false) {
            Log::warning('Invalid refresh token format: Missing | delimiter.');
            return response()->json(['message' => 'Invalid refresh token format.'], 401);
        }

        list($tokenId, $token) = explode('|', $refreshTokenFromCookie, 2);
        $tokenData = PersonalAccessToken::find($tokenId);

        Log::info('Token Split Data:', ['id' => $tokenId, 'token_hash' => hash('sha256', $token)]); 

        if ( !$tokenData || !hash_equals($tokenData->token, hash('sha256', $token)) || $tokenData->name !== 'refresh_token'){
            
            $status = 'Fail';
            if(!$tokenData) $status = 'Token record not found in DB';
            else if(!hash_equals($tokenData->token, hash('sha256', $token))) $status = 'Token hash mismatch';
            else if($tokenData->name !== 'refresh_token') $status = 'Token name mismatch (expected refresh_token)';
            
            Log::error('Invalid refresh token validation failure.', ['status' => $status, 'db_name' => $tokenData->name ?? 'N/A']); 

            return response()->json(['message' => 'Invalid refresh token.'], 401);
        }
        
        if ($tokenData->created_at->addDays(7)->isPast()) { 
            Log::warning('Refresh token expired (Created At: ' . $tokenData->created_at . '). Deleting record.'); 
            $tokenData->delete();
            return response()->json(['message' => 'Refresh token expired. Please log in again.'], 401);
        }
        
        $user = $tokenData->tokenable;
        
        $user->tokens()->where('name', 'access_token')->delete();
        $newAccessToken = $user->createToken('access_token', ['*'], Carbon::now()->addMinutes(config('sanctum.expiration')))->plainTextToken;

        Log::info('Refresh Token Successful. New Access Token generated for User ID: ' . $user->id); 

        return response()->json([
            'access_token' => $newAccessToken,
        ]);
    }
}
