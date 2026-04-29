<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — PanganTrace AI Gateway
|--------------------------------------------------------------------------
| Gateway hanya melayani API. Web routes redirect ke frontend.
*/

Route::get('/', function () {
    return response()->json([
        'service' => 'PanganTrace AI Gateway',
        'version' => '1.0.0',
        'status' => 'running',
        'docs' => '/api/docs',
        'frontend' => env('FRONTEND_URL', 'http://localhost:3000'),
    ]);
});
