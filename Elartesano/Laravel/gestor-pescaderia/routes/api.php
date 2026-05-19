<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\IngredienteController;
use App\Http\Controllers\Api\PlatoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlatoIngredienteController;
use App\Http\Controllers\Api\ReservaController;
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateMe']);
    Route::post('/me', [AuthController::class, 'createMe']);
    Route::delete('/me', [AuthController::class, 'deleteMe']);
    Route::post('/logout', [AuthController::class, 'logout']);

     Route::get('/reservas/horas',  [ReservaController::class, 'getHorasDisponibles']);
    Route::post('/reservas',       [ReservaController::class, 'store']);
    Route::get('/users', [AuthController::class, 'index']);
    Route::get('/users/{id}', [AuthController::class, 'show']);
    Route::put('/users/{id}', [AuthController::class, 'update']);
    Route::post('/users', [AuthController::class, 'store']);
    Route::delete('/users/{id}', [AuthController::class, 'destroy']);
    Route::delete('/platos/{id}', [PlatoController::class, 'destroy']);
    Route::post('/ingredientes', [IngredienteController::class, 'store']);
    Route::delete('/ingredientes/{id}', [IngredienteController::class, 'destroy']);
});
    Route::get('/platos', [PlatoController::class, 'index']);

Route::get('/ingredientes', [IngredienteController::class, 'index']);
Route::get('/ingredientes/{id}', [IngredienteController::class, 'show']);
Route::put('/ingredientes/{id}', [IngredienteController::class, 'update']);
Route::post('/platos', [PlatoController::class, 'store']);
Route::get('/platos/{id}', [PlatoController::class, 'show']);
Route::put('/platos/{id}', [PlatoController::class, 'update']);

Route::get('/plato-ingrediente/filter/{plato_id}', [PlatoIngredienteController::class, 'filter']);