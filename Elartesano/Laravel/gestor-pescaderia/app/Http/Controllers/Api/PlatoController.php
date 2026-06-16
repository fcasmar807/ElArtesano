<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plato;
class PlatoController extends Controller
{
    public function index()
    {
        // Lógica para obtener y devolver una lista de platos
        $platos = Plato::all();
        return response()->json($platos);
    }

public function store(Request $request)
{
    
    $request->validate([
        'nombre'      => 'required|string|max:100',
        'descripcion' => 'nullable|string|max:500',
        'precio'      => 'required|numeric|min:0',
        'estado'      => 'nullable|string',
        'imagen'      => 'nullable|image|max:2048',
    ]);

    $imagenPath = null;
    if ($request->hasFile('imagen')) {
        $imagenPath = $request->file('imagen')->store('platos', 'public');
    }

    $plato = Plato::create([
        'nombre'      => $request->nombre,
        'descripcion' => $request->descripcion,
        'precio'      => $request->precio,
        'estado'      => $request->estado ?? 'activo',
        'imagen'      => $imagenPath,
    ]);

    return response()->json($plato, 201);
}
   public function destroy($id)
{
    $plato = Plato::find($id);

    if (!$plato) {
        return response()->json([
            'error' => 'Plato no encontrado'
        ], 404);
    }

    // Borrar primero las relaciones en plato_ingrediente
    $plato->ingredientes()->detach();

    $plato->delete();

    return response()->json([
        'message' => 'Plato eliminado correctamente'
    ], 200);
}

    public function show($id)
    {
        // Lógica para obtener y devolver un plato específico por su ID
        $plato = Plato::findOrFail($id);
        return response()->json($plato);
    }
    
}