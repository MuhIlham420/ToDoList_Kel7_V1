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

        // Dapatkan nama hari dalam Bahasa Indonesia untuk mencocokkan jadwal kuliah
        $daysMap = [
            0 => 'Minggu',
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu'
        ];
        $hariIni = $daysMap[$now->dayOfWeek];

        // Ambil jadwal kuliah hari ini milik user
        $jadwalHariIni = $user->jadwalKuliah()->where('hari', $hariIni)->get();

        // Cek apakah sekarang sedang berada dalam jam kuliah
        $nowStr = $now->format('H:i:s');
        $kuliahAktif = null;
        foreach ($jadwalHariIni as $jadwal) {
            if ($nowStr >= $jadwal->jam_mulai && $nowStr <= $jadwal->jam_selesai) {
                $kuliahAktif = $jadwal;
                break;
            }
        }

        // Cek apakah jam sekarang dalam rentang jam fokus
        $jamFokusMulai  = Carbon::parse($profil->jam_fokus_mulai);
        $jamFokusSelesai = Carbon::parse($profil->jam_fokus_selesai);
        $dalamJamFokus   = $now->between($jamFokusMulai, $jamFokusSelesai);

        // --- Perhitungan Ringkasan Waktu Hari Ini ---
        // Hitung total durasi kuliah hari ini (dalam menit)
        $totalDurasiKuliah = 0;
        foreach ($jadwalHariIni as $jadwal) {
            $mulai = Carbon::parse($jadwal->jam_mulai);
            $selesai = Carbon::parse($jadwal->jam_selesai);
            if ($selesai->greaterThan($mulai)) {
                $totalDurasiKuliah += $selesai->diffInMinutes($mulai, true);
            }
        }

        // Hitung total durasi jam fokus default user
        $totalDurasiFocus = 0;
        if ($jamFokusSelesai->greaterThan($jamFokusMulai)) {
            $totalDurasiFocus = $jamFokusSelesai->diffInMinutes($jamFokusMulai, true);
        }

        // Hitung durasi jam fokus yang bentrok dengan jadwal kuliah
        $durasiBentrok = 0;
        foreach ($jadwalHariIni as $jadwal) {
            $kMulai = Carbon::parse($jadwal->jam_mulai);
            $kSelesai = Carbon::parse($jadwal->jam_selesai);
            
            // Irisan antara [jamFokusMulai, jamFokusSelesai] dan [kMulai, kSelesai]
            $irisanMulai = $jamFokusMulai->greaterThan($kMulai) ? $jamFokusMulai : $kMulai;
            $irisanSelesai = $jamFokusSelesai->lessThan($kSelesai) ? $jamFokusSelesai : $kSelesai;
            
            if ($irisanSelesai->greaterThan($irisanMulai)) {
                $durasiBentrok += $irisanSelesai->diffInMinutes($irisanMulai, true);
            }
        }
        
        $focusEfektifMenit = max(0, $totalDurasiFocus - $durasiBentrok);

        // Hitung skor prioritas untuk setiap tugas
        $tugasDenganSkor = $tugasPending->map(function ($tugas) use ($now, $dalamJamFokus, $kuliahAktif) {

            // === 1. IMPORTANCE (bobot 0.35) ===
            // Langsung menggunakan nilai importance tugas (1-5)
            $importance = $tugas->importance;

            // === 2. COGNITIVE LOAD MATCH (bobot 0.30) ===
            // Mencocokkan beban kognitif tugas dengan waktu fokus user
            //
            // Logika:
            // - Jika SEDANG KULIAH: tugas berat (cognitive_load >= 3) diberi penalti besar (skor 0)
            //   karena tidak boleh dikerjakan di kelas. Tugas super ringan (cognitive_load = 1) diberi skor 3
            //   karena masih bisa dicicil tipis-tipis.
            // - Jika TIDAK KULIAH dan DALAM jam fokus DAN tugas berat (cognitive_load >= 4) → skor 5
            // - Jika TIDAK KULIAH dan DI LUAR jam fokus DAN tugas ringan (cognitive_load <= 2) → skor 3
            // - Selainnya → skor 1
            $cognitiveLoadMatch = 1; // default: mismatch
            if ($kuliahAktif && $tugas->cognitive_load >= 3) {
                $cognitiveLoadMatch = 0; // Saat kuliah, hindari tugas sedang/berat
            } elseif ($kuliahAktif && $tugas->cognitive_load <= 1) {
                $cognitiveLoadMatch = 3; // Saat kuliah, hanya tugas sangat ringan yang masih masuk akal
            } elseif ($dalamJamFokus && $tugas->cognitive_load >= 4) {
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
            $deadlineAt = Carbon::parse($tugas->deadline);
            $daysUntilDeadline = (int) ceil($now->diffInDays($deadlineAt, false));
            $calendarDaysUntilDeadline = (int) $now->copy()
                ->startOfDay()
                ->diffInDays($deadlineAt->copy()->startOfDay(), false);

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
            if ($kuliahAktif && $tugas->cognitive_load >= 3) {
                $alasanParts[] = "Sedang ada kuliah {$kuliahAktif->mata_kuliah}, tugas sedang/berat sebaiknya ditunda (cognitive_load: {$tugas->cognitive_load}/5)";
            } elseif ($kuliahAktif && $tugas->cognitive_load <= 1) {
                $alasanParts[] = "Sedang ada kuliah {$kuliahAktif->mata_kuliah}, hanya tugas sangat ringan yang masih cocok dicicil (cognitive_load: {$tugas->cognitive_load}/5)";
            } elseif ($dalamJamFokus && $tugas->cognitive_load >= 4) {
                $alasanParts[] = "Saat ini dalam jam fokus optimal, cocok untuk tugas berat (cognitive_load: {$tugas->cognitive_load}/5)";
            } elseif (!$dalamJamFokus && $tugas->cognitive_load <= 2) {
                $alasanParts[] = "Di luar jam fokus, tugas ringan cocok dikerjakan sekarang (cognitive_load: {$tugas->cognitive_load}/5)";
            } else {
                $alasanParts[] = "Kecocokan waktu dan beban kognitif kurang optimal (cognitive_load: {$tugas->cognitive_load}/5)";
            }

            // Alasan deadline
            if ($deadlineAt->isPast()) {
                if ($deadlineAt->isToday()) {
                    $alasanParts[] = "Deadline hari ini dan waktunya sudah lewat, segera kerjakan";
                } else {
                    $hariLewat = abs($calendarDaysUntilDeadline);
                    $alasanParts[] = "Deadline sudah lewat {$hariLewat} hari, perlu segera diselesaikan";
                }
            } elseif ($calendarDaysUntilDeadline === 0) {
                $alasanParts[] = "Deadline hari ini, prioritaskan segera";
            } elseif ($calendarDaysUntilDeadline === 1) {
                $alasanParts[] = "Deadline besok, sangat urgent";
            } elseif ($calendarDaysUntilDeadline <= 3) {
                $alasanParts[] = "Deadline dalam {$calendarDaysUntilDeadline} hari";
            } else {
                $alasanParts[] = "Deadline masih sekitar {$calendarDaysUntilDeadline} hari lagi";
            }

            $tugas->alasan = implode('. ', $alasanParts) . '.';

            return $tugas;
        });

        // Urutkan dari skor tertinggi ke terendah
        $tugasSorted = $tugasDenganSkor->sortByDesc('skor_prioritas')->values();

        return $this->jsonResponse(true, 'Rekomendasi tugas berhasil di-generate.', [
            'waktu_sekarang'  => $now->toIso8601String(),
            'dalam_jam_fokus' => $dalamJamFokus,
            'kuliah_aktif'    => $kuliahAktif ? [
                'mata_kuliah' => $kuliahAktif->mata_kuliah,
                'jam_mulai'   => substr($kuliahAktif->jam_mulai, 0, 5),
                'jam_selesai' => substr($kuliahAktif->jam_selesai, 0, 5),
                'ruangan'     => $kuliahAktif->ruangan,
            ] : null,
            'kuliah_hari_ini' => $jadwalHariIni->map(function ($j) {
                return [
                    'id'          => $j->id,
                    'mata_kuliah' => $j->mata_kuliah,
                    'jam_mulai'   => substr($j->jam_mulai, 0, 5),
                    'jam_selesai' => substr($j->jam_selesai, 0, 5),
                    'ruangan'     => $j->ruangan,
                ];
            })->values(),
            'ringkasan_hari_ini' => [
                'total_kuliah_menit' => $totalDurasiKuliah,
                'jumlah_kuliah'      => $jadwalHariIni->count(),
                'fokus_total_menit'  => $totalDurasiFocus,
                'fokus_efektif_menit'=> $focusEfektifMenit,
                'bentrok_menit'      => $durasiBentrok,
            ],
            'profil_sirkadian'=> [
                'tipe'           => $profil->tipe_sirkadian,
                'jam_fokus_mulai'=> $profil->jam_fokus_mulai,
                'jam_fokus_selesai'=> $profil->jam_fokus_selesai,
                'jam_tidur'      => $profil->jam_tidur,
                'jam_bangun'     => $profil->jam_bangun,
            ],
            'rekomendasi'     => RekomendasiResource::collection($tugasSorted),
        ]);
    }
}
