<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use Illuminate\Http\Request;

class MesaController extends Controller
{
  
      public function index()
    {
        $mesas = Mesa::where('estado', 'disponible')
            ->orderBy('numero')
            ->get(['id', 'numero', 'capacidad', 'estado']);

        return response()->json($mesas);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero' => 'required|integer|min:1|unique:mesas,numero',
            'capacidad' => 'required|integer|min:1',
            'estado' => 'required|in:disponible,ocupada,reservada,inactiva',
        ]);
        return response()->json(Mesa::create($validated), 201);
    }
    public function show(string $id)
    {
        return response()->json(Mesa::with('reservas')->findOrFail($id));
    }
    public function update(Request $request, string $id)
    {
        $mesa = Mesa::findOrFail($id);
        $validated = $request->validate([
            'numero' => 'sometimes|integer|min:1|unique:mesas,numero,' . $mesa->id,
            'capacidad' => 'sometimes|integer|min:1',
            'estado' => 'sometimes|in:disponible,ocupada,reservada,inactiva',
        ]);
        $mesa->update($validated);
        return response()->json($mesa);
    }
    public function destroy(string $id)
    {
        Mesa::findOrFail($id)->delete();
        return response()->json(['message' => 'Mesa eliminada']);
    }
}
