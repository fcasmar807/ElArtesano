<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mesa;
class MesaController extends Controller
{
    public function index()
    {
        // Lógica para obtener y devolver una lista de mesas
        $mesas = Mesa::all();
        return response()->json($mesas);
    }

    public function store(Request $request)
    {
        // Lógica para crear un nueva mesa
        $codigo = $request->input('codigo');
        $nombre = $request->input('nombre');
        $descripcion = $request->input('descripcion');
        $mesa = Mesa::create([
            'codigo' => $codigo,
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            
        ]);
        return redirect()->route('mesas.index');
    }
}