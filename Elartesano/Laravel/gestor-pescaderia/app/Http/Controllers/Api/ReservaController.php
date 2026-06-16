<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reserva;
use Illuminate\Support\Facades\Auth;
class ReservaController extends Controller
{
   public function getHorasDisponibles(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date|after_or_equal:today',
        ]);

        // Horas de servicio de la pescadería — ajusta según tu horario
        $todasLasHoras = [
            '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30',
            '14:00', '14:30', '20:00', '20:30',
            '21:00', '21:30', '22:00',
        ];

        // Horas ya ocupadas en esa fecha (estado != cancelada)
        $horasOcupadas = Reserva::where('fecha', $request->fecha)
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->pluck('hora')
            ->toArray();

        $horasDisponibles = array_values(
            array_diff($todasLasHoras, $horasOcupadas)
        );

        return response()->json([
            'fecha'  => $request->fecha,
            'horas'  => $horasDisponibles,
        ]);
    }

    /**
     * POST_RESERVA_ENDPOINT
     * Crea una reserva para el usuario autenticado.
     * Uso: POST /api/reservas
     */
    public function store(Request $request)
    {
       $datos = $request->validate([
            'fecha'   => 'required|date|after_or_equal:today',
            'hora'    => 'required|date_format:H:i',
            'mesa_id' => 'required|exists:mesas,id',

        ]);
 
        // Comprobar que la hora sigue libre antes de guardar
        $ocupada = Reserva::where('fecha', $request->fecha)
            ->where('hora', $request->hora)
            ->where('mesa_id', $request->mesa_id)
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->exists();

            
        if ($ocupada) {
            return response()->json([
                'error' => 'Esa hora ya no está disponible para esta mesa.',
            ], 409);
        }
         
        $datos['user_id'] = Auth::user()->id; //Problema, no agarra la ID
        $datos['estado'] = 'pendiente';

        $reserva = Reserva::create($datos);

        return response()->json([
            'message' => 'Reserva creada correctamente.',
            'reserva' => $reserva,
        ], 201);
    }

/**
 * GET_RESERVAS_ENDPOINT
 * Devuelve todas las reservas con el usuario asociado.
 * Uso: GET /api/reservas
 */
public function index()
{
$reservas = Reserva::with('user')
        ->orderBy('fecha', 'desc')
        ->get();

    if ($reservas->isEmpty()) {
        return response()->json(['message' => 'No hay reservas registradas'], 404);
    }

    return response()->json($reservas, 200);
}
/**
 * Devuelve solo las reservas del usuario autenticado.
 * GET /api/mis-reservas
 */
public function misReservas(Request $request)
{
    $reservas = Reserva::where('user_id', Auth::id())
        ->orderBy('fecha', 'desc')
        ->get();

    return response()->json($reservas, 200);
}
public function confirmar($id)
{
    $reserva = Reserva::find($id);

    if (!$reserva) {
        return response()->json(['error' => 'Reserva no encontrada'], 404);
    }

    $reserva->estado = 'confirmada';
    $reserva->save();

    return response()->json([
        'message' => 'Reserva confirmada correctamente',
        'reserva' => $reserva,
    ], 200);
}
public function cancelar($id)
{
    $reserva = Reserva::find($id);
    if (!$reserva) {
        return response()->json(['error' => 'Reserva no encontrada'], 404);
    }
    $reserva->estado = 'cancelada';
    $reserva->save();
    return response()->json(['message' => 'Reserva cancelada', 'reserva' => $reserva], 200);
}

public function completar($id)
{
    $reserva = Reserva::find($id);
    if (!$reserva) {
        return response()->json(['error' => 'Reserva no encontrada'], 404);
    }
    $reserva->estado = 'completada';
    $reserva->save();
    return response()->json(['message' => 'Reserva completada', 'reserva' => $reserva], 200);
}
public function destroy($id)
{
    $reserva = Reserva::find($id);

    if (!$reserva) {
        return response()->json([
            'error' => 'Reserva no encontrada'
        ], 404);
    }

    $reserva->delete();

    return response()->json([
        'message' => 'Reserva eliminada correctamente'
    ], 200);
}
}