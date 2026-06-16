<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plato;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class PlatoController extends Controller
{
    public function index()
    {
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

        $imagenUrl = null;
        if ($request->hasFile('imagen')) {
            try {
                $resultado = Cloudinary::upload($request->file('imagen')->getRealPath(), [
                    'folder' => 'pescaderia/platos'
                ]);
                $imagenUrl = $resultado->getSecurePath();
            } catch (\Exception $e) {
                return response()->json([
                    'error' => $e->getMessage()
                ], 500);
            }
        }

        $plato = Plato::create([
            'nombre'      => $request->nombre,
            'descripcion' => $request->descripcion,
            'precio'      => $request->precio,
            'estado'      => $request->estado ?? 'activo',
            'imagen'      => $imagenUrl, // Ahora guarda la URL completa
        ]);

        return response()->json($plato, 201);
    }

    public function destroy($id)
    {
        $plato = Plato::find($id);

        if (!$plato) {
            return response()->json(['error' => 'Plato no encontrado'], 404);
        }

        $plato->ingredientes()->detach();
        $plato->delete();

        return response()->json(['message' => 'Plato eliminado correctamente'], 200);
    }

    public function show($id)
    {
        $plato = Plato::findOrFail($id);
        return response()->json($plato);
    }
}
