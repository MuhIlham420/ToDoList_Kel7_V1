<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JadwalKuliah\StoreJadwalKuliahRequest;
use App\Http\Requests\JadwalKuliah\UpdateJadwalKuliahRequest;
use App\Http\Resources\JadwalKuliahResource;
use App\Models\JadwalKuliah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JadwalKuliahController extends Controller
{
    /**
     * List semua jadwal kuliah milik user yang sedang login.
     */
    public function index(Request $request): JsonResponse
    {
        $jadwal = $request->user()->jadwalKuliah()
            ->orderByRaw("
                CASE hari
                    WHEN 'Senin' THEN 1
                    WHEN 'Selasa' THEN 2
                    WHEN 'Rabu' THEN 3
                    WHEN 'Kamis' THEN 4
                    WHEN 'Jumat' THEN 5
                    WHEN 'Sabtu' THEN 6
                    ELSE 7
                END
            ")
            ->orderBy('jam_mulai', 'asc')
            ->get();

        return $this->jsonResponse(true, 'Daftar jadwal kuliah berhasil diambil.', [
            'jadwal_kuliah' => JadwalKuliahResource::collection($jadwal),
        ]);
    }

    /**
     * Tambah jadwal kuliah baru.
     */
    public function store(StoreJadwalKuliahRequest $request): JsonResponse
    {
        $jadwal = $request->user()->jadwalKuliah()->create($request->validated());

        return $this->jsonResponse(true, 'Jadwal kuliah berhasil ditambahkan.', [
            'jadwal_kuliah' => new JadwalKuliahResource($jadwal),
        ], 201);
    }

    /**
     * Update jadwal kuliah.
     * Menggunakan policy untuk memastikan hanya pemilik yang bisa update.
     */
    public function update(UpdateJadwalKuliahRequest $request, JadwalKuliah $jadwalKuliah): JsonResponse
    {
        $this->authorize('update', $jadwalKuliah);

        $jadwalKuliah->update($request->validated());

        return $this->jsonResponse(true, 'Jadwal kuliah berhasil diperbarui.', [
            'jadwal_kuliah' => new JadwalKuliahResource($jadwalKuliah->fresh()),
        ]);
    }

    /**
     * Hapus jadwal kuliah.
     * Menggunakan policy untuk memastikan hanya pemilik yang bisa hapus.
     */
    public function destroy(JadwalKuliah $jadwalKuliah): JsonResponse
    {
        $this->authorize('delete', $jadwalKuliah);

        $jadwalKuliah->delete();

        return $this->jsonResponse(true, 'Jadwal kuliah berhasil dihapus.');
    }
}
