<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfilSirkadianResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'user_id'           => $this->user_id,
            'tipe_sirkadian'    => $this->tipe_sirkadian,
            'jam_fokus_mulai'   => $this->jam_fokus_mulai,
            'jam_fokus_selesai' => $this->jam_fokus_selesai,
            'jam_tidur'         => $this->jam_tidur,
            'jam_bangun'        => $this->jam_bangun,
            'created_at'        => $this->created_at?->toIso8601String(),
            'updated_at'        => $this->updated_at?->toIso8601String(),
        ];
    }
}
