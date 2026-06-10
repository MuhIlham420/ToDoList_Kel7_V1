<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed 2 user dummy untuk testing.
     */
    public function run(): void
    {
        User::create([
            'name'     => 'Ahmad Rizky',
            'email'    => 'ahmad@example.com',
            'password' => 'password123',
            'fakultas' => 'Fakultas Teknik',
            'jurusan'  => 'Teknik Informatika',
            'no_hp'    => '081234567890',
        ]);

        User::create([
            'name'     => 'Siti Nurhaliza',
            'email'    => 'siti@example.com',
            'password' => 'password123',
            'fakultas' => 'Fakultas Ekonomi',
            'jurusan'  => 'Manajemen',
            'no_hp'    => '081298765432',
        ]);
    }
}
