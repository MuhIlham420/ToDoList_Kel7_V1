<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tugas extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     */
    protected $table = 'tugas';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'judul_tugas',
        'deskripsi',
        'deadline',
        'cognitive_load',
        'importance',
        'preference',
        'estimasi_durasi',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
            'cognitive_load' => 'integer',
            'importance' => 'integer',
            'preference' => 'integer',
            'estimasi_durasi' => 'integer',
        ];
    }

    /**
     * Tugas dimiliki oleh satu user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
