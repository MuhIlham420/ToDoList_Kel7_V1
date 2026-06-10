<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tugas\StoreTugasRequest;
use App\Http\Requests\Tugas\UpdateTugasRequest;
use App\Http\Resources\TugasResource;
use App\Models\Tugas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TugasController extends Controller
{
    /**
     * List semua tugas milik user yang sedang login.
     * Support filter berdasarkan status dan cognitive_load.
     *
     * Query params:
     * - status: 'pending' atau 'completed'
     * - cognitive_load: integer 1-5
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tugas();

        // Filter berdasarkan status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan cognitive_load
        if ($request->has('cognitive_load')) {
            $query->where('cognitive_load', $request->cognitive_load);
        }

        $tugas = $query->orderBy('deadline', 'asc')->get();

        return $this->jsonResponse(true, 'Daftar tugas berhasil diambil.', [
            'tugas' => TugasResource::collection($tugas),
        ]);
    }

    /**
     * Tambah tugas baru untuk user yang sedang login.
     */
    public function store(StoreTugasRequest $request): JsonResponse
    {
        $tugas = $request->user()->tugas()->create($request->validated());

        return $this->jsonResponse(true, 'Tugas berhasil ditambahkan.', [
            'tugas' => new TugasResource($tugas),
        ], 201);
    }

    /**
     * Update tugas yang ada.
     * Menggunakan policy untuk memastikan hanya pemilik yang bisa update.
     */
    public function update(UpdateTugasRequest $request, Tugas $tugas): JsonResponse
    {
        $this->authorize('update', $tugas);

        $tugas->update($request->validated());

        return $this->jsonResponse(true, 'Tugas berhasil diperbarui.', [
            'tugas' => new TugasResource($tugas->fresh()),
        ]);
    }

    /**
     * Hapus tugas.
     * Menggunakan policy untuk memastikan hanya pemilik yang bisa hapus.
     */
    public function destroy(Tugas $tugas): JsonResponse
    {
        $this->authorize('delete', $tugas);

        $tugas->delete();

        return $this->jsonResponse(true, 'Tugas berhasil dihapus.');
    }

    /**
     * Tandai tugas sebagai selesai (completed).
     * Menggunakan policy untuk memastikan hanya pemilik yang bisa update.
     */
    public function complete(Tugas $tugas): JsonResponse
    {
        $this->authorize('update', $tugas);

        $tugas->update(['status' => 'completed']);

        return $this->jsonResponse(true, 'Tugas berhasil ditandai selesai.', [
            'tugas' => new TugasResource($tugas->fresh()),
        ]);
    }
}
