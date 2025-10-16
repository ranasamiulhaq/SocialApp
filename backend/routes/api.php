<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;


//Public Routes
Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);


//Protected Routes
Route::group(['middleware' => ['auth:sanctum']],function(){
    Route::post('/logout',[AuthController::class,'logout']);
    Route::get('/user', function(Request $request){
        return $request->user();
    });
});

//Refresh Token
Route::post('refresh',[AuthController::class,'refreshToken']);

