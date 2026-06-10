<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JadwalKuliahController;
use App\Http\Controllers\Api\ProfilSirkadianController;
use App\Http\Controllers\Api\RekomendasiController;
use App\Http\Controllers\Api\TugasController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — DeepWork Sirkadian ToDoList
|--------------------------------------------------------------------------
|
| Semua route API untuk aplikasi manajemen tugas mahasiswa
| berbasis ritme sirkadian (waktu fokus optimal).
|
*/

// =============================================
// AUTH ROUTES (prefix: /api/auth)
// =============================================
Route::prefix('auth')->group(function () {
    // Public routes (tanpa autentikasi)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes (butuh autentikasi)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// =============================================
// TUGAS ROUTES (prefix: /api/tugas)
// Semua butuh autentikasi
// =============================================
Route::middleware('auth:sanctum')->prefix('tugas')->group(function () {
    Route::get('/', [TugasController::class, 'index']);
    Route::post('/', [TugasController::class, 'store']);
    Route::put('/{tugas}', [TugasController::class, 'update']);
    Route::delete('/{tugas}', [TugasController::class, 'destroy']);
    Route::patch('/{tugas}/complete', [TugasController::class, 'complete']);
});

// =============================================
// JADWAL KULIAH ROUTES (prefix: /api/jadwal-kuliah)
// Semua butuh autentikasi
// =============================================
Route::middleware('auth:sanctum')->prefix('jadwal-kuliah')->group(function () {
    Route::get('/', [JadwalKuliahController::class, 'index']);
    Route::post('/', [JadwalKuliahController::class, 'store']);
    Route::put('/{jadwalKuliah}', [JadwalKuliahController::class, 'update']);
    Route::delete('/{jadwalKuliah}', [JadwalKuliahController::class, 'destroy']);
});

// =============================================
// PROFIL SIRKADIAN ROUTES (prefix: /api/profil-sirkadian)
// Semua butuh autentikasi
// =============================================
Route::middleware('auth:sanctum')->prefix('profil-sirkadian')->group(function () {
    Route::get('/', [ProfilSirkadianController::class, 'show']);
    Route::put('/', [ProfilSirkadianController::class, 'update']);
});

// =============================================
// REKOMENDASI ROUTES (prefix: /api/rekomendasi)
// Butuh autentikasi
// =============================================
Route::middleware('auth:sanctum')->prefix('rekomendasi')->group(function () {
    Route::get('/', [RekomendasiController::class, 'index']);
});
