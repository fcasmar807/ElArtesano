<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    //
    public function login(Request $request)
    {
        Log::info('Intento de login con email: ' . $request->email);
        // Validar los datos de entrada
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);
        $credenciales = $request->only('email', 'password');

        if (Auth::attempt($credenciales)) {
            $token = $request->user()->createToken('api_token')->plainTextToken;
            return response()->json([
                'token' => $token

            ]);
        } else {
            return response()->json([
                'error' => 'Credenciales incorrectas'
            ], 401);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
   
}
