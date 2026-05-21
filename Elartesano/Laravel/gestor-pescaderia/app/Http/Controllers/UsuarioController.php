<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(User::with(['role', 'reservas'])->get());
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:usuarios,email',
            'password' => 'required|min:6',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'required|in:activo,inactivo,bloqueado,pendiente',
            'role_id' => 'required|exists:roles,id',
        ]);
        $validated['password'] = Hash::make($validated['password']);
        $usuario = User::create($validated);
        return response()->json($usuario->load('role'), 201);
    }
    public function show(string $id)
    {
        return response()->json(User::with(['role', 'reservas'])->findOrFail($id));
    }
    public function update(Request $request, string $id)
    {
        $usuario = User::findOrFail($id);
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|max:150|unique:usuarios,email,' . $usuario->id,
            'password' => 'sometimes|min:6',
            'telefono' => 'nullable|string|max:20',
            'estado' => 'sometimes|in:activo,inactivo,bloqueado,pendiente',
            'role_id' => 'sometimes|exists:roles,id',
        ]);
        if (isset($validated['password'])) $validated['password'] = Hash::make($validated['password']);
        $usuario->update($validated);
        return response()->json($usuario->load('role'));
    }
    public function destroy(string $id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User eliminado']);
    }
}
