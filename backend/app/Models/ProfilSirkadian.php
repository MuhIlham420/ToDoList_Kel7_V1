<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilSirkadian extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'tipe_sirkadian',
        'jam_fokus_mulai',
        'jam_fokus_selesai',
        'jam_tidur',
        'jam_bangun',
    ];

    /**
     * Profil sirkadian dimiliki oleh satu user (relasi 1:1).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
