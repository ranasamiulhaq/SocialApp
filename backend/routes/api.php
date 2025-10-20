<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\FollowController;


//Public Routes
Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);


//Protected Routes
Route::group(['middleware' => ['auth:sanctum']],function(){
    Route::post('/logout',[AuthController::class,'logout']);

    Route::get('/users', [FollowController::class, 'getAllUsers']);
    Route::post('/follow/{user}', [FollowController::class, 'followUser']); 
    Route::post('/unfollow/{user}', [FollowController::class, 'unfollowUser']);
    Route::get('/following', [FollowController::class, 'getFollowingList']);
    Route::get('/followers', [FollowController::class, 'getFollowersList']); 

    Route::get('/feed', [PostController::class, 'getFeedPosts']); 

    Route::get('/post',[PostController::class,'getAllPosts']);
    Route::get('/post/{id}',[PostController::class,'getPostById']);
    Route::post('/post',[PostController::class,'createPost']);
    Route::delete('/post/{id}',[PostController::class,'deletePost']);



    Route::get('/user', function(Request $request){
        return $request->user();
    });
});

//Refresh Token
Route::post('refresh',[AuthController::class,'refreshToken']);

