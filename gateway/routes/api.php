<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProxyController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes — PanganTrace AI Gateway
|--------------------------------------------------------------------------
*/

// ── Public (no auth) ────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ── Authenticated (Sanctum) ─────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Users (admin only)
    Route::get('/users', [UserController::class, 'index']);
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
    Route::delete('/users/{user}', [UserController::class, 'deactivate']);

    // ── AI Services (proxy to FastAPI) ──────────
    Route::prefix('v1')->group(function () {
        // Anomaly detection
        Route::get('/anomaly/summary', [ProxyController::class, 'get']);
        Route::post('/anomaly/detect', [ProxyController::class, 'detectAnomaly']);

        // Price prediction
        Route::get('/prices/current', [ProxyController::class, 'get']);
        Route::post('/prices/predict', [ProxyController::class, 'predictPrice']);

        // Insights
        Route::get('/insights/daily-summary', [ProxyController::class, 'get']);
        Route::post('/insights/generate', [ProxyController::class, 'generateInsight']);

        // Supply chain
        Route::get('/chain/{path}', [ProxyController::class, 'get'])->where('path', '.*');

        // Alerts
        Route::get('/alerts', [ProxyController::class, 'get']);
        Route::get('/alerts/{id}', [ProxyController::class, 'get']);
    });
});
