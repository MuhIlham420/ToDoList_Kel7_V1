<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TugasResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'judul_tugas'     => $this->judul_tugas,
            'deskripsi'       => $this->deskripsi,
            'deadline'        => $this->deadline?->toIso8601String(),
            'cognitive_load'  => $this->cognitive_load,
            'importance'      => $this->importance,
            'preference'      => $this->preference,
            'estimasi_durasi' => $this->estimasi_durasi,
            'status'          => $this->status,
            'created_at'      => $this->created_at?->toIso8601String(),
            'updated_at'      => $this->updated_at?->toIso8601String(),
        ];
    }
}
