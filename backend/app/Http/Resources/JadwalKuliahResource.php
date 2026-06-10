<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JadwalKuliahResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'user_id'     => $this->user_id,
            'mata_kuliah' => $this->mata_kuliah,
            'hari'        => $this->hari,
            'jam_mulai'   => $this->jam_mulai,
            'jam_selesai' => $this->jam_selesai,
            'ruangan'     => $this->ruangan,
            'created_at'  => $this->created_at?->toIso8601String(),
            'updated_at'  => $this->updated_at?->toIso8601String(),
        ];
    }
}
