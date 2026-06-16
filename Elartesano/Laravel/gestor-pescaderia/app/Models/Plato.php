<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Plato extends Model
{
    use HasFactory;
     protected $table = 'platos';

      protected $fillable = [
 
        'nombre',
        'descripcion',
        'precio',
        'imagen',
        'estado'
    ];

  

 public function ingredientes()
{
    return $this->belongsToMany(Ingrediente::class, 'plato_ingrediente');
}
}
