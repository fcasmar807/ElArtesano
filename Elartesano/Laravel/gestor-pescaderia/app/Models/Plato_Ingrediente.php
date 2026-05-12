<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Plato;
use App\Models\Ingrediente;

class Plato_Ingrediente extends Model
{
    protected $table = 'plato_ingrediente';

    protected $fillable = [
     
        'plato_id',
        'ingrediente_id',
      
    ];

    public function plato()
    {
        return $this->belongsTo(Plato::class, 'plato_id');
    }

    public function ingrediente()
    {
        return $this->belongsTo(Ingrediente::class, 'ingrediente_id');
    }
}