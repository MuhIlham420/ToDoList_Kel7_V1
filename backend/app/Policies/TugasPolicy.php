<?php

namespace App\Policies;

use App\Models\Tugas;
use App\Models\User;

class TugasPolicy
{
    /**
     * Hanya pemilik tugas yang bisa melihat tugas tersebut.
     */
    public function view(User $user, Tugas $tugas): bool
    {
        return $user->id === $tugas->user_id;
    }

    /**
     * Hanya pemilik tugas yang bisa mengupdate tugas tersebut.
     */
    public function update(User $user, Tugas $tugas): bool
    {
        return $user->id === $tugas->user_id;
    }

    /**
     * Hanya pemilik tugas yang bisa menghapus tugas tersebut.
     */
    public function delete(User $user, Tugas $tugas): bool
    {
        return $user->id === $tugas->user_id;
    }
}
