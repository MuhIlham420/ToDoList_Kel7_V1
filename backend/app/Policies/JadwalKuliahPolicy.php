<?php

namespace App\Policies;

use App\Models\JadwalKuliah;
use App\Models\User;

class JadwalKuliahPolicy
{
    /**
     * Hanya pemilik jadwal yang bisa melihat jadwal tersebut.
     */
    public function view(User $user, JadwalKuliah $jadwalKuliah): bool
    {
        return $user->id === $jadwalKuliah->user_id;
    }

    /**
     * Hanya pemilik jadwal yang bisa mengupdate jadwal tersebut.
     */
    public function update(User $user, JadwalKuliah $jadwalKuliah): bool
    {
        return $user->id === $jadwalKuliah->user_id;
    }

    /**
     * Hanya pemilik jadwal yang bisa menghapus jadwal tersebut.
     */
    public function delete(User $user, JadwalKuliah $jadwalKuliah): bool
    {
        return $user->id === $jadwalKuliah->user_id;
    }
}
