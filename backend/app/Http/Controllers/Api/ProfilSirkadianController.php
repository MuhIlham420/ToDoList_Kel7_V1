<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfilSirkadian\UpdateProfilSirkadianRequest;
use App\Http\Resources\ProfilSirkadianResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfilSirkadianController extends Controller
{
    /**
     * Ambil profil sirkadian user yang sedang login.
     * Jika belum ada, buat profil default secara otomatis.
     *
     * Default profil:
     * - tipe_sirkadian: 'pagi'
     * - jam_fokus_mulai: 08:00
     * - jam_fokus_selesai: 12:00
     * - jam_tidur: 22:00
     * - jam_bangun: 06:00
     */
    public function show(Request $request): JsonResponse
    {
        $profil = $request->user()->profilSirkadian;

        // Auto-create jika belum ada profil sirkadian
        if (!$profil) {
            $profil = $request->user()->profilSirkadian()->create([
                'tipe_sirkadian'   => 'pagi',
                'jam_fokus_mulai'  => '08:00',
                'jam_fokus_selesai'=> '12:00',
                'jam_tidur'        => '22:00',
                'jam_bangun'       => '06:00',
            ]);
        }

        return $this->jsonResponse(true, 'Profil sirkadian berhasil diambil.', [
            'profil_sirkadian' => new ProfilSirkadianResource($profil),
        ]);
    }

    /**
     * Update profil sirkadian user.
     * Buat otomatis jika belum ada, lalu update.
     */
    public function update(UpdateProfilSirkadianRequest $request): JsonResponse
    {
        $profil = $request->user()->profilSirkadian;

        if (!$profil) {
            // Buat dulu dengan default, lalu update
            $profil = $request->user()->profilSirkadian()->create(array_merge([
                'tipe_sirkadian'   => 'pagi',
                'jam_fokus_mulai'  => '08:00',
                'jam_fokus_selesai'=> '12:00',
                'jam_tidur'        => '22:00',
                'jam_bangun'       => '06:00',
            ], $request->validated()));
        } else {
            $profil->update($request->validated());
            $profil = $profil->fresh();
        }

        return $this->jsonResponse(true, 'Profil sirkadian berhasil diperbarui.', [
            'profil_sirkadian' => new ProfilSirkadianResource($profil),
        ]);
    }
}
