<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class ProfilSirkadianSeeder extends Seeder
{
    /**
     * Seed profil sirkadian dummy untuk user.
     */
    public function run(): void
    {
        $ahmad = User::where('email', 'ahmad@example.com')->first();
        if ($ahmad) {
            $ahmad->profilSirkadian()->create([
                'tipe_sirkadian'   => 'pagi',
                'jam_fokus_mulai'  => '08:00',
                'jam_fokus_selesai'=> '12:00',
                'jam_tidur'        => '22:00',
                'jam_bangun'       => '05:00',
            ]);
        }

        $siti = User::where('email', 'siti@example.com')->first();
        if ($siti) {
            $siti->profilSirkadian()->create([
                'tipe_sirkadian'   => 'malam',
                'jam_fokus_mulai'  => '19:00',
                'jam_fokus_selesai'=> '23:00',
                'jam_tidur'        => '01:00',
                'jam_bangun'       => '08:00',
            ]);
        }
    }
}
