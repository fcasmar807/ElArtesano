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
        // Lógica para crear un nuevo plato
        $nombre = $request->input('nombre');
        $descripcion = $request->input('descripcion');
        $precio = $request->input('precio');
        $plato = Plato::create([
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'precio' => $precio
        ]);
        return redirect()->route('platos.index');
    }
    public function destroy($platoId)
{
    $plato = Plato::find($platoId);

    if (!$plato) {
        return response()->json([
            'error' => 'Plato no encontrado'
        ], 404);
    }

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