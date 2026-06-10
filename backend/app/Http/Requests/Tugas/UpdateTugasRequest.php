<?php

namespace App\Http\Requests\Tugas;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTugasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul_tugas'    => 'sometimes|required|string|max:255',
            'deskripsi'      => 'nullable|string',
            'deadline'       => 'sometimes|required|date',
            'cognitive_load' => 'sometimes|required|integer|between:1,5',
            'importance'     => 'sometimes|required|integer|between:1,5',
            'preference'     => 'sometimes|required|integer|between:1,5',
            'estimasi_durasi'=> 'sometimes|required|integer|min:1',
            'status'         => 'sometimes|required|in:pending,completed',
        ];
    }

    public function messages(): array
    {
        return [
            'judul_tugas.required'    => 'Judul tugas wajib diisi.',
            'deadline.date'           => 'Format deadline tidak valid.',
            'cognitive_load.between'  => 'Beban kognitif harus antara 1-5.',
            'importance.between'      => 'Tingkat kepentingan harus antara 1-5.',
            'preference.between'      => 'Preferensi harus antara 1-5.',
            'estimasi_durasi.min'     => 'Estimasi durasi minimal 1 menit.',
            'status.in'              => 'Status harus berupa pending atau completed.',
        ];
    }
}
