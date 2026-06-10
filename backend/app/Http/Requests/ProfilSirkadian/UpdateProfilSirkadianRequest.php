<?php

namespace App\Http\Requests\ProfilSirkadian;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfilSirkadianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipe_sirkadian'  => 'sometimes|required|in:pagi,siang,malam',
            'jam_fokus_mulai' => 'sometimes|required|date_format:H:i',
            'jam_fokus_selesai'=> 'sometimes|required|date_format:H:i',
            'jam_tidur'       => 'sometimes|required|date_format:H:i',
            'jam_bangun'      => 'sometimes|required|date_format:H:i',
        ];
    }

    public function messages(): array
    {
        return [
            'tipe_sirkadian.in'          => 'Tipe sirkadian harus salah satu dari: pagi, siang, malam.',
            'jam_fokus_mulai.date_format'=> 'Format jam fokus mulai harus HH:MM.',
            'jam_fokus_selesai.date_format'=> 'Format jam fokus selesai harus HH:MM.',
            'jam_tidur.date_format'      => 'Format jam tidur harus HH:MM.',
            'jam_bangun.date_format'     => 'Format jam bangun harus HH:MM.',
        ];
    }
}
