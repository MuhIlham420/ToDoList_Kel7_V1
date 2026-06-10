<?php

namespace Database\Seeders;

use App\Models\Tugas;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TugasSeeder extends Seeder
{
    /**
     * Seed 8 tugas dummy dengan variasi cognitive_load, importance, dan deadline.
     * Tugas di-assign ke user pertama (ahmad@example.com).
     */
    public function run(): void
    {
        $user = User::where('email', 'ahmad@example.com')->first();

        if (!$user) return;

        $tugasData = [
            [
                'judul_tugas'     => 'Tugas Akhir Algoritma - Implementasi Graph',
                'deskripsi'       => 'Implementasi algoritma Dijkstra dan BFS pada graf berbobot.',
                'deadline'        => Carbon::now()->addDays(1),
                'cognitive_load'  => 5,
                'importance'      => 5,
                'preference'      => 4,
                'estimasi_durasi' => 180,
                'status'          => 'pending',
            ],
            [
                'judul_tugas'     => 'Laporan Praktikum Basis Data',
                'deskripsi'       => 'Menulis laporan query SQL join dan subquery.',
                'deadline'        => Carbon::now()->addDays(2),
                'cognitive_load'  => 3,
                'importance'      => 4,
                'preference'      => 3,
                'estimasi_durasi' => 120,
                'status'          => 'pending',
            ],
            [
                'judul_tugas'     => 'Quiz Online Statistika',
                'deskripsi'       => 'Persiapan quiz bab distribusi normal dan uji hipotesis.',
                'deadline'        => Carbon::now()->addDays(3),
                'cognitive_load'  => 4,
                'importance'      => 4,
                'preference'      => 2,
                'estimasi_durasi' => 90,
                'status'          => 'pending',
            ],
            [
                'judul_tugas'     => 'Presentasi Sistem Informasi',
                'deskripsi'       => 'Membuat slide presentasi tentang analisis kebutuhan sistem.',
                'deadline'        => Carbon::now()->addDays(5),
                'cognitive_load'  => 2,
                'importance'      => 3,
                'preference'      => 5,
                'estimasi_durasi' => 60,
                'status'          => 'pending',
            ],
            [
                'judul_tugas'     => 'Resume Paper Machine Learning',
                'deskripsi'       => 'Merangkum paper tentang Random Forest dan XGBoost.',
                'deadline'        => Carbon::now()->addDays(7),
                'cognitive_load'  => 4,
                'importance'      => 3,
                'preference'      => 3,
                'estimasi_durasi' => 150,
                'status'          => 'pending',
            ],
            [
                'judul_tugas'     => 'Tugas Membuat ERD',
                'deskripsi'       => 'Membuat Entity Relationship Diagram untuk studi kasus perpustakaan.',
                'deadline'        => Carbon::now()->addDays(10),
                'cognitive_load'  => 2,
                'importance'      => 2,
                'preference'      => 4,
                'estimasi_durasi' => 45,
                'status'          => 'pending',
            ],
            [
                'judul_tugas'     => 'Proyek Akhir Web Development',
                'deskripsi'       => 'Membangun aplikasi CRUD dengan Laravel dan React.',
                'deadline'        => Carbon::now()->addDays(14),
                'cognitive_load'  => 5,
                'importance'      => 5,
                'preference'      => 5,
                'estimasi_durasi' => 480,
                'status'          => 'pending',
            ],
            [
                'judul_tugas'     => 'Tugas Membaca Buku Etika Profesi',
                'deskripsi'       => 'Membaca dan merangkum Bab 3-5 buku Etika Profesi IT.',
                'deadline'        => Carbon::now()->addDays(4),
                'cognitive_load'  => 1,
                'importance'      => 2,
                'preference'      => 1,
                'estimasi_durasi' => 30,
                'status'          => 'completed',
            ],
        ];

        foreach ($tugasData as $data) {
            $user->tugas()->create($data);
        }
    }
}
