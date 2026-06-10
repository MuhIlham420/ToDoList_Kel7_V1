<?php

namespace App\Http\Requests\Tugas;

use Illuminate\Foundation\Http\FormRequest;

class StoreTugasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul_tugas'    => 'required|string|max:255',
            'deskripsi'      => 'nullable|string',
            'deadline'       => 'required|date|after:now',
            'cognitive_load' => 'required|integer|between:1,5',
            'importance'     => 'required|integer|between:1,5',
            'preference'     => 'required|integer|between:1,5',
            'estimasi_durasi'=> 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'judul_tugas.required'    => 'Judul tugas wajib diisi.',
            'deadline.required'       => 'Deadline wajib diisi.',
            'deadline.after'          => 'Deadline harus setelah waktu sekarang.',
            'cognitive_load.required' => 'Beban kognitif wajib diisi.',
            'cognitive_load.between'  => 'Beban kognitif harus antara 1-5.',
            'importance.required'     => 'Tingkat kepentingan wajib diisi.',
            'importance.between'      => 'Tingkat kepentingan harus antara 1-5.',
            'preference.required'     => 'Preferensi wajib diisi.',
            'preference.between'      => 'Preferensi harus antara 1-5.',
            'estimasi_durasi.required'=> 'Estimasi durasi wajib diisi.',
            'estimasi_durasi.min'     => 'Estimasi durasi minimal 1 menit.',
        ];
    }
}
