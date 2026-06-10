<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class JadwalKuliahSeeder extends Seeder
{
    /**
     * Seed 5 jadwal kuliah dummy untuk user pertama.
     */
    public function run(): void
    {
        $user = User::where('email', 'ahmad@example.com')->first();

        if (!$user) return;

        $jadwalData = [
            [
                'mata_kuliah' => 'Algoritma dan Struktur Data',
                'hari'        => 'Senin',
                'jam_mulai'   => '08:00',
                'jam_selesai' => '10:30',
                'ruangan'     => 'Lab Komputer 1',
            ],
            [
                'mata_kuliah' => 'Basis Data',
                'hari'        => 'Selasa',
                'jam_mulai'   => '10:00',
                'jam_selesai' => '12:30',
                'ruangan'     => 'Ruang 301',
            ],
            [
                'mata_kuliah' => 'Statistika',
                'hari'        => 'Rabu',
                'jam_mulai'   => '13:00',
                'jam_selesai' => '15:30',
                'ruangan'     => 'Ruang 202',
            ],
            [
                'mata_kuliah' => 'Sistem Informasi',
                'hari'        => 'Kamis',
                'jam_mulai'   => '08:00',
                'jam_selesai' => '10:30',
                'ruangan'     => 'Ruang 105',
            ],
            [
                'mata_kuliah' => 'Pemrograman Web',
                'hari'        => 'Jumat',
                'jam_mulai'   => '10:00',
                'jam_selesai' => '12:30',
                'ruangan'     => 'Lab Komputer 2',
            ],
        ];

        foreach ($jadwalData as $data) {
            $user->jadwalKuliah()->create($data);
        }
    }
}
