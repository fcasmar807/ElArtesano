<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\IngredienteController;
use App\Http\Controllers\Api\PlatoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlatoIngredienteController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\MesaController;
use App\Http\Controllers\Api\UserController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [UserController::class, 'me']);
    Route::put('/me', [UserController::class, 'updateMe']);
    Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/mis-reservas', [ReservaController::class, 'misReservas']);
    Route::post('/ingredientes', [IngredienteController::class, 'store']);
    Route::delete('/ingredientes/{id}', [IngredienteController::class, 'destroy']);
    Route::post('/reservas',       [ReservaController::class, 'store']);
});
Route::delete('/me', [UserController::class, 'deleteMe']);
Route::post('/me', [UserController::class, 'createMe']);
Route::patch('/reservas/{id}/confirmar', [ReservaController::class, 'confirmar']);
Route::patch('/reservas/{id}/cancelar',  [ReservaController::class, 'cancelar']);
Route::patch('/reservas/{id}/completar', [ReservaController::class, 'completar']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::post('/users', [UserController::class, 'store']);
Route::delete('/users/{id}', [UserController::class, 'deleteMe']);
Route::delete('/platos/{id}', [PlatoController::class, 'destroy']);
Route::get('/platos', [PlatoController::class, 'index']);
Route::get('/mesas', [MesaController::class, 'index']);
Route::get('/reservas/horas',  [ReservaController::class, 'getHorasDisponibles']);
Route::get('/reservas', [ReservaController::class, 'index']);
Route::delete('/reservas/{id}', [ReservaController::class, 'destroy']);
Route::get('/ingredientes', [IngredienteController::class, 'index']);
Route::get('/ingredientes/{id}', [IngredienteController::class, 'show']);
Route::put('/ingredientes/{id}', [IngredienteController::class, 'update']);
Route::post('/platos', [PlatoController::class, 'store']);
Route::get('/platos/{id}', [PlatoController::class, 'show']);
Route::put('/platos/{id}', [PlatoController::class, 'update']);
Route::get('/plato-ingrediente/filter/{plato_id}', [PlatoIngredienteController::class, 'filter']);
