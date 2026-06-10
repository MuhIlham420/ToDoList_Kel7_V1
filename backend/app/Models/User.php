<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'fakultas',
        'jurusan',
        'no_hp',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * User memiliki banyak tugas.
     */
    public function tugas()
    {
        return $this->hasMany(Tugas::class);
    }

    /**
     * User memiliki banyak jadwal kuliah.
     */
    public function jadwalKuliah()
    {
        return $this->hasMany(JadwalKuliah::class);
    }

    /**
     * User memiliki satu profil sirkadian.
     */
    public function profilSirkadian()
    {
        return $this->hasOne(ProfilSirkadian::class);
    }
}
