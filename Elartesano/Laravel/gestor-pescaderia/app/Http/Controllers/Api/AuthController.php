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
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telefono' => $user->telefono,
            'fecha_registro' => $user->fecha_registro,
            'rol_id' => $user->rol_id
        ]);
    }
    public function updateMe(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'telefono' => 'sometimes|required|string|max:20',
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('telefono')) {
            $user->telefono = $request->telefono;
        }


        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'fecha_registro' => $user->fecha_registro,
                'rol_id' => $user->rol_id
            ]
        ]);
    }
    public function createMe(Request $request)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'telefono' => 'required|string',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'telefono' => $request->telefono,
            'fecha_registro' => now(),
            'rol_id' => 1, // 👈 por defecto
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => $user
        ], 201);
    }
    public function deleteMe(Request $request)
    {

        $user = User::find($request->user()->id);
        if ($user) {
            $user->delete();
            return response()->json([
                'message' => 'Usuario eliminado correctamente'
            ]);
        } else {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }
    }
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }
    public function show($id)
    {
        $user = User::find($id);
        if ($user) {
            return response()->json($user);
        } else {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }
    }
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);        
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'telefono' => 'sometimes|required|string|max:20',
            'rol_id' => 'sometimes|required|integer|exists:roles,id',
        ]);
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('telefono')) {
            $user->telefono = $request->telefono;
        }
        if ($request->has('rol_id')) {
            $user->rol_id = $request->rol_id;
        }

        $user->save();

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user
        ]);
    }
}
