<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\RolSlug;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Reserva;
use App\Models\Mesa;
use App\Models\Role;

// Authenticatable proporciona la funcionalidad de autenticación al modelo User
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasApiTokens , Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'telefono',
        'estado',
        'role_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function reservas()
    {
 return $this->hasMany(Reserva::class, 'user_id');    }



    public function role()
    {
        return $this->belongsTo(Role::class);
    }



    // Necesario ???
    public function isAdmin()
    {
        $administradorRole = Role::where('slug', RolSlug::ADMIN)->first();
        return $this->role->id === $administradorRole->id;
    }

    // Necesario ???
    public function isUser()
    {
        return $this->role->slug === RolSlug::USER;
    }
}
