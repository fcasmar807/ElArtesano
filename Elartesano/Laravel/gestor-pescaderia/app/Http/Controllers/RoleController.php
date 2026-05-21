<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(Role::with('usuarios')->get());
    }
    public function store(Request $request)
    {
        $validated = $request->validate(['nombre' => 'required|string|max:50|unique:roles,nombre']);
        return response()->json(Role::create($validated), 201);
    }
    public function show(string $id)
    {
        return response()->json(Role::with('usuarios')->findOrFail($id));
    }
    public function update(Request $request, string $id)
    {
        $role = Role::findOrFail($id);
        $validated = $request->validate(['nombre' => 'required|string|max:50|unique:roles,nombre,' . $role->id]);
        $role->update($validated);
        return response()->json($role);
    }
    public function destroy(string $id)
    {
        Role::findOrFail($id)->delete();
        return response()->json(['message' => 'Rol eliminado']);
    }
}
