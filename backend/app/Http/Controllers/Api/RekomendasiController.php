<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RekomendasiResource;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RekomendasiController extends Controller
{
    /**
     * Generate rekomendasi urutan pengerjaan tugas hari ini.
     *
     * ALGORITMA REKOMENDASI:
     * skor = (importance × 0.35) + (cognitive_load_match × 0.30) + (deadline_urgency × 0.25) + (preference × 0.10)
     *
     * Dimana:
     * - importance          : nilai importance tugas (1–5)
     * - cognitive_load_match: tergantung apakah jam sekarang dalam jam fokus dan level cognitive_load
     * - deadline_urgency    : semakin dekat deadline, semakin urgent
     * - preference          : nilai preference tugas (1–5)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Ambil profil sirkadian user, buat default jika belum ada
        $profil = $user->profilSirkadian;
        if (!$profil) {
            $profil = $user->profilSirkadian()->create([
                'tipe_sirkadian'   => 'pagi',
                'jam_fokus_mulai'  => '08:00',
                'jam_fokus_selesai'=> '12:00',
                'jam_tidur'        => '22:00',
                'jam_bangun'       => '06:00',
            ]);
        }

        // Ambil semua tugas pending milik user
        $tugasPending = $user->tugas()
            ->where('status', 'pending')
            ->get();

        if ($tugasPending->isEmpty()) {
            return $this->jsonResponse(true, 'Tidak ada tugas pending saat ini.', [
                'rekomendasi' => [],
            ]);
        }

        $now = Carbon::now();

        // Cek apakah jam sekarang dalam rentang jam fokus
        $jamFokusMulai  = Carbon::parse($profil->jam_fokus_mulai);
        $jamFokusSelesai = Carbon::parse($profil->jam_fokus_selesai);
        $dalamJamFokus   = $now->between($jamFokusMulai, $jamFokusSelesai);

        // Hitung skor prioritas untuk setiap tugas
        $tugasDenganSkor = $tugasPending->map(function ($tugas) use ($now, $dalamJamFokus) {

            // === 1. IMPORTANCE (bobot 0.35) ===
            // Langsung menggunakan nilai importance tugas (1-5)
            $importance = $tugas->importance;

            // === 2. COGNITIVE LOAD MATCH (bobot 0.30) ===
            // Mencocokkan beban kognitif tugas dengan waktu fokus user
            //
            // Logika:
            // - Jika DALAM jam fokus DAN tugas berat (cognitive_load >= 4) → skor 5
            //   (waktu fokus optimal untuk tugas berat)
            // - Jika DI LUAR jam fokus DAN tugas ringan (cognitive_load <= 2) → skor 3
            //   (di luar jam fokus, cocok untuk tugas ringan)
            // - Selainnya → skor 1
            //   (mismatch antara waktu dan beban tugas)
            $cognitiveLoadMatch = 1; // default: mismatch
            if ($dalamJamFokus && $tugas->cognitive_load >= 4) {
                $cognitiveLoadMatch = 5; // Jam fokus + tugas berat = optimal
            } elseif (!$dalamJamFokus && $tugas->cognitive_load <= 2) {
                $cognitiveLoadMatch = 3; // Di luar fokus + tugas ringan = cukup cocok
            }

            // === 3. DEADLINE URGENCY (bobot 0.25) ===
            // Semakin dekat deadline, semakin tinggi urgency
            //
            // Skala:
            // - deadline <= 1 hari → 5 (sangat urgent)
            // - deadline <= 2 hari → 4 (urgent)
            // - deadline <= 3 hari → 3 (sedang)
            // - deadline <= 7 hari → 2 (tidak terlalu urgent)
            // - deadline > 7 hari  → 1 (masih lama)
            $daysUntilDeadline = $now->diffInDays($tugas->deadline, false);

            if ($daysUntilDeadline <= 1) {
                $deadlineUrgency = 5;
            } elseif ($daysUntilDeadline <= 2) {
                $deadlineUrgency = 4;
            } elseif ($daysUntilDeadline <= 3) {
                $deadlineUrgency = 3;
            } elseif ($daysUntilDeadline <= 7) {
                $deadlineUrgency = 2;
            } else {
                $deadlineUrgency = 1;
            }

            // === 4. PREFERENCE (bobot 0.10) ===
            // Langsung menggunakan nilai preference tugas (1-5)
            $preference = $tugas->preference;

            // === HITUNG SKOR AKHIR ===
            $skor = ($importance * 0.35)
                  + ($cognitiveLoadMatch * 0.30)
                  + ($deadlineUrgency * 0.25)
                  + ($preference * 0.10);

            // Bulatkan ke 2 desimal
            $tugas->skor_prioritas = round($skor, 2);

            // === GENERATE ALASAN (penjelasan skor) ===
            $alasanParts = [];

            // Alasan importance
            if ($importance >= 4) {
                $alasanParts[] = "Tugas ini sangat penting (importance: {$importance}/5)";
            } elseif ($importance >= 3) {
                $alasanParts[] = "Tugas ini cukup penting (importance: {$importance}/5)";
            } else {
                $alasanParts[] = "Tingkat kepentingan rendah (importance: {$importance}/5)";
            }

            // Alasan cognitive load match
            if ($dalamJamFokus && $tugas->cognitive_load >= 4) {
                $alasanParts[] = "Saat ini dalam jam fokus optimal, cocok untuk tugas berat (cognitive_load: {$tugas->cognitive_load}/5)";
            } elseif (!$dalamJamFokus && $tugas->cognitive_load <= 2) {
                $alasanParts[] = "Di luar jam fokus, tugas ringan cocok dikerjakan sekarang (cognitive_load: {$tugas->cognitive_load}/5)";
            } else {
                $alasanParts[] = "Kecocokan waktu dan beban kognitif kurang optimal (cognitive_load: {$tugas->cognitive_load}/5)";
            }

            // Alasan deadline
            if ($daysUntilDeadline <= 0) {
                $alasanParts[] = "DEADLINE SUDAH LEWAT atau HARI INI! Harus segera dikerjakan";
            } elseif ($daysUntilDeadline <= 1) {
                $alasanParts[] = "Deadline besok, sangat urgent";
            } elseif ($daysUntilDeadline <= 3) {
                $alasanParts[] = "Deadline dalam {$daysUntilDeadline} hari";
            } else {
                $alasanParts[] = "Deadline masih {$daysUntilDeadline} hari lagi";
            }

            $tugas->alasan = implode('. ', $alasanParts) . '.';

            return $tugas;
        });

        // Urutkan dari skor tertinggi ke terendah
        $tugasSorted = $tugasDenganSkor->sortByDesc('skor_prioritas')->values();

        return $this->jsonResponse(true, 'Rekomendasi tugas berhasil di-generate.', [
            'waktu_sekarang'  => $now->toIso8601String(),
            'dalam_jam_fokus' => $dalamJamFokus,
            'profil_sirkadian'=> [
                'tipe'           => $profil->tipe_sirkadian,
                'jam_fokus_mulai'=> $profil->jam_fokus_mulai,
                'jam_fokus_selesai'=> $profil->jam_fokus_selesai,
            ],
            'rekomendasi'     => RekomendasiResource::collection($tugasSorted),
        ]);
    }
}
