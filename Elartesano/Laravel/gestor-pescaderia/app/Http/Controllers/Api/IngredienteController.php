<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ingrediente;

class IngredienteController extends Controller
{
    //
     public function index()
    {
        $ingredientes = Ingrediente::all();
        return $ingredientes->toJson();
    }
    public function store(Request $request)
   {
         $nombre = $request->input('nombre');
         $id = Ingrediente::create(['nombre' => $nombre])->id;
         
                 return redirect()->route('ingredientes.index');
    }
}
