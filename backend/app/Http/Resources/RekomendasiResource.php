<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RekomendasiResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Resource ini menambahkan field skor_prioritas dan alasan
     * yang dihitung oleh RekomendasiController.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'judul_tugas'     => $this->judul_tugas,
            'deskripsi'       => $this->deskripsi,
            'deadline'        => $this->deadline?->toIso8601String(),
            'cognitive_load'  => $this->cognitive_load,
            'importance'      => $this->importance,
            'preference'      => $this->preference,
            'estimasi_durasi' => $this->estimasi_durasi,
            'status'          => $this->status,
            'skor_prioritas'  => $this->skor_prioritas ?? null,
            'alasan'          => $this->alasan ?? null,
        ];
    }
}
