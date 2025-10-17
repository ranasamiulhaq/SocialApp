<?php

return [

    // ... (comments)

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // FIX 2: MUST be specific origin, NOT '*' when credentials are true
    'allowed_origins' => ['http://localhost:5173'], 

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // FIX 1: This MUST be true to allow the browser to process the response
    // when the frontend sends the request with 'withCredentials: true'.
    'supports_credentials' => true, 
];