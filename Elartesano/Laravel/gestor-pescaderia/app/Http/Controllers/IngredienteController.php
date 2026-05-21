<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Ingrediente;
use Illuminate\Http\Request;

class IngredienteController extends Controller
{
    public function index()
    {
        return response()->json(Ingrediente::with('platos')->get());
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:120|unique:ingredientes,nombre',
        ]);
        return response()->json(Ingrediente::create($validated), 201);
    }
    public function show(string $id)
    {
        return response()->json(Ingrediente::with('platos')->findOrFail($id));
    }
    public function update(Request $request, string $id)
    {
        $ingrediente = Ingrediente::findOrFail($id);
        $validated = $request->validate([
            'nombre' => 'required|string|max:120|unique:ingredientes,nombre,' . $ingrediente->id,
        ]);
        $ingrediente->update($validated);
        return response()->json($ingrediente);
    }
    public function destroy(string $id)
    {
        Ingrediente::findOrFail($id)->delete();
        return response()->json(['message' => 'Ingrediente eliminado']);
    }
}
