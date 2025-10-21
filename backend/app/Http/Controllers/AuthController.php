<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
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

        // Delete all existing tokens for this user
        $user->tokens()->delete();
        
        // Create access token (short-lived)
        $accessToken = $user->createToken(
            'access_token',
            ['*'], 
            Carbon::now()->addMinutes(config('sanctum.expiration', 1)) // 1 minute for testing
        )->plainTextToken;
        
        // Create refresh token (long-lived)
        $refreshToken = $user->createToken(
            'refresh_token',
            ['*'], 
            Carbon::now()->addDays(7)
        )->plainTextToken;

        Log::info('Login Successful', [
            'user_id' => $user->id,
            'access_token_expires' => Carbon::now()->addMinutes(config('sanctum.expiration', 1)),
            'refresh_token_expires' => Carbon::now()->addDays(7),
            'refresh_token_preview' => substr($refreshToken, 0, 30) . '...'
        ]); 
        
        // Calculate cookie expiration (7 days from now)
        $expires = Carbon::now()->addDays(7);
        
        // Build cookie string manually
        $cookieValue = sprintf(
            'refresh_token=%s; Path=/; HttpOnly; SameSite=Lax; Expires=%s',
            $refreshToken,
            $expires->format('D, d M Y H:i:s') . ' GMT'
        );
        
        Log::info('Setting Cookie Header', ['cookie_header' => substr($cookieValue, 0, 100) . '...']);
        
        return response()->json([
            'message' => 'Token Granted',
            'access_token'=> $accessToken,
            'user' => $user,
        ])->header('Set-Cookie', $cookieValue);
    }

    public function logout(Request $request){
        $request->user()->tokens()->delete();
        
        // Clear the cookie
        $cookieValue = 'refresh_token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        return response()->json(['message' => 'User Logged Out Successfully'])
            ->header('Set-Cookie', $cookieValue);
    }

    public function refreshToken(Request $request)
    {
        Log::info('=== REFRESH TOKEN ATTEMPT STARTED ==='); 
        
        // Get refresh token from cookie
        $refreshTokenFromCookie = $request->cookie('refresh_token');
        
        Log::info('Cookie Check', [
            'cookie_exists' => !is_null($refreshTokenFromCookie),
            'cookie_length' => $refreshTokenFromCookie ? strlen($refreshTokenFromCookie) : 0,
            'cookie_preview' => $refreshTokenFromCookie ? substr($refreshTokenFromCookie, 0, 30) . '...' : 'NULL',
            'all_cookies' => array_keys($request->cookies->all()),
            'raw_cookie_header' => $request->header('Cookie')
        ]);
        
        if (!$refreshTokenFromCookie) {
            Log::warning('Refresh token not found in cookie');
            return response()->json(['message' => 'Refresh token not found.'], 401);
        }

        // Validate token format (should contain pipe separator)
        if (strpos($refreshTokenFromCookie, '|') === false) {
            Log::warning('Invalid refresh token format: Missing pipe delimiter');
            return response()->json(['message' => 'Invalid refresh token format.'], 401);
        }

        // Split token into ID and actual token
        list($tokenId, $token) = explode('|', $refreshTokenFromCookie, 2);
        
        Log::info('Token Split', [
            'token_id' => $tokenId,
            'token_hash_preview' => substr(hash('sha256', $token), 0, 20) . '...'
        ]); 

        // Find token in database
        $tokenData = PersonalAccessToken::find($tokenId);

        if (!$tokenData) {
            Log::error('Token record not found in database', ['token_id' => $tokenId]);
            return response()->json(['message' => 'Invalid refresh token.'], 401);
        }

        // Verify token hash
        if (!hash_equals($tokenData->token, hash('sha256', $token))) {
            Log::error('Token hash mismatch');
            return response()->json(['message' => 'Invalid refresh token.'], 401);
        }

        // Verify token name
        if ($tokenData->name !== 'refresh_token') {
            Log::error('Token name mismatch', [
                'expected' => 'refresh_token',
                'actual' => $tokenData->name
            ]);
            return response()->json(['message' => 'Invalid refresh token.'], 401);
        }
        
        // Check if token is expired using expires_at field
        if ($tokenData->expires_at && Carbon::parse($tokenData->expires_at)->isPast()) {
            Log::warning('Refresh token expired', [
                'expires_at' => $tokenData->expires_at,
                'now' => Carbon::now()
            ]);
            $tokenData->delete();
            return response()->json(['message' => 'Refresh token expired. Please log in again.'], 401);
        }
        
        // Get user from token
        $user = $tokenData->tokenable;
        
        if (!$user) {
            Log::error('User not found for token', ['token_id' => $tokenId]);
            return response()->json(['message' => 'User not found.'], 401);
        }
        
        // Delete old access tokens only (keep refresh token)
        $user->tokens()->where('name', 'access_token')->delete();
        
        // Create new access token
        $newAccessToken = $user->createToken(
            'access_token',
            ['*'], 
            Carbon::now()->addMinutes(config('sanctum.expiration', 1))
        )->plainTextToken;

        Log::info('Refresh Token Successful', [
            'user_id' => $user->id,
            'new_access_token_preview' => substr($newAccessToken, 0, 30) . '...',
            'expires_at' => Carbon::now()->addMinutes(config('sanctum.expiration', 1))
        ]); 

        return response()->json([
            'access_token' => $newAccessToken,
        ]);
    }
}