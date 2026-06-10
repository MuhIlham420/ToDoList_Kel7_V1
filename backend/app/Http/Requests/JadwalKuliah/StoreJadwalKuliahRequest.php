<?php

namespace App\Http\Requests\JadwalKuliah;

use Illuminate\Foundation\Http\FormRequest;

class StoreJadwalKuliahRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mata_kuliah' => 'required|string|max:255',
            'hari'        => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai'   => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'ruangan'     => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'mata_kuliah.required' => 'Nama mata kuliah wajib diisi.',
            'hari.required'        => 'Hari wajib diisi.',
            'hari.in'              => 'Hari harus salah satu dari: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu.',
            'jam_mulai.required'   => 'Jam mulai wajib diisi.',
            'jam_mulai.date_format'=> 'Format jam mulai harus HH:MM.',
            'jam_selesai.required' => 'Jam selesai wajib diisi.',
            'jam_selesai.date_format'=> 'Format jam selesai harus HH:MM.',
            'jam_selesai.after'    => 'Jam selesai harus setelah jam mulai.',
        ];
    }
}
