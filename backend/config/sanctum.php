<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Requests from the following domains / hosts will receive stateful API
    | authentication cookies. For a pure stateless token API, this should
    | be empty.
    |
    */
    // CORRECTED: Set to an empty array for a pure stateless API.
    'stateful' => [],

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | This array should be empty for pure token-based authentication. This
    | forces Sanctum to immediately look for the Bearer token instead of
    | checking for a web session first.
    |
    */
    // CORRECTED: This is the main fix. Set to an empty array.
    'guard' => [],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls the number of minutes until an issued token will be
    | considered expired. This is used when creating the access token.
    |
    */
    // CORRECTED: Removed the duplicate key and set a clear expiration time.
    'expiration' => 2,

    /*
    |--------------------------------------------------------------------------
    | Token Prefix
    |--------------------------------------------------------------------------
    */
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    */
    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],

];

