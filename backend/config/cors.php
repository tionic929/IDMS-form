<?php

$allowedOrigins = array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', ''))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins ?: [
        'http://localhost:5172',
        'http://127.0.0.1:5172',
        'https://ncnian-id.svizcarra.online',
        'https://dashboard-ncnian-id.svizcarra.online',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
