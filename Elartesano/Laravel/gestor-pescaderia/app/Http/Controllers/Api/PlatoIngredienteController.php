<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plato;
use App\Models\Ingrediente;
use App\Models\Plato_Ingrediente;

class PlatoIngredienteController extends Controller
{
    public function index()
    {
        // Lógica para obtener y devolver una lista de platos con sus ingredientes
        $platos = Plato::with('ingredientes')->get();
        return response()->json($platos);
    }

    public function store(Request $request)
    {
        // Lógica para asociar un ingrediente a un plato
        $validated = $request->validate([
            'plato_id' => 'required|exists:platos,id',
            'ingrediente_id' => 'required|exists:ingredientes,id',
        ]);
        $platoIngrediente = Plato_Ingrediente::create([
            'plato_id' => $validated['plato_id'],
            'ingrediente_id' => $validated['ingrediente_id'],
        ]);
        return response()->json($platoIngrediente, 201);
    }

 public function filter($plato_id)
{
    $plato = Plato::find($plato_id);

    if (!$plato) {
        return response()->json(['message' => 'Plato no encontrado'], 404);
    }

    $platoIngredientes = Plato_Ingrediente::with('ingrediente')  
                            ->where('plato_id', $plato_id)
                            ->get();

    return response()->json($platoIngredientes, 200);
}

}