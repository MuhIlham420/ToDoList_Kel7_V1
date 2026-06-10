<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel profil_sirkadian — menyimpan profil ritme sirkadian user.
     * Relasi 1:1 dengan users (unique constraint pada user_id).
     */
    public function up(): void
    {
        Schema::create('profil_sirkadians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->enum('tipe_sirkadian', ['pagi', 'siang', 'malam'])->default('pagi');
            $table->time('jam_fokus_mulai');
            $table->time('jam_fokus_selesai');
            $table->time('jam_tidur');
            $table->time('jam_bangun');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profil_sirkadians');
    }
};
