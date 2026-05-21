<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function index()
    {
        return response()->json(Reserva::with(['usuario', 'mesa'])->get());
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i:s',
            'estado' => 'required|in:pendiente,confirmada,cancelada,completada',
            'usuario_id' => 'required|exists:usuarios,id',
            'mesa_id' => 'required|exists:mesas,id',
        ]);
        $reserva = Reserva::create($validated);
        return response()->json($reserva->load(['usuario', 'mesa']), 201);
    }
    public function show(string $id)
    {
        return response()->json(Reserva::with(['usuario', 'mesa'])->findOrFail($id));
    }
    public function update(Request $request, string $id)
    {
        $reserva = Reserva::findOrFail($id);
        $validated = $request->validate([
            'fecha' => 'sometimes|date',
            'hora' => 'sometimes|date_format:H:i:s',
            'estado' => 'sometimes|in:pendiente,confirmada,cancelada,completada',
            'usuario_id' => 'sometimes|exists:usuarios,id',
            'mesa_id' => 'sometimes|exists:mesas,id',
        ]);
        $reserva->update($validated);
        return response()->json($reserva->load(['usuario', 'mesa']));
    }
    public function destroy(string $id)
    {
        Reserva::findOrFail($id)->delete();
        return response()->json(['message' => 'Reserva eliminada']);
    }
}
