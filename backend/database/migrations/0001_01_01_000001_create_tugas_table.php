<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel tugas — menyimpan daftar tugas mahasiswa beserta metadata
     * untuk perhitungan rekomendasi sirkadian (cognitive_load, importance, preference).
     */
    public function up(): void
    {
        Schema::create('tugas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('judul_tugas');
            $table->text('deskripsi')->nullable();
            $table->dateTime('deadline');
            $table->tinyInteger('cognitive_load')->comment('Beban kognitif 1-5');
            $table->tinyInteger('importance')->comment('Tingkat kepentingan 1-5');
            $table->tinyInteger('preference')->comment('Preferensi pengerjaan 1-5');
            $table->integer('estimasi_durasi')->comment('Estimasi durasi dalam menit');
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas');
    }
};
