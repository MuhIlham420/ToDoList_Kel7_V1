<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Registrasi user baru.
     * Setelah berhasil, langsung buat token dan kembalikan.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password, // Auto hashed via cast
            'fakultas' => $request->fakultas,
            'jurusan'  => $request->jurusan,
            'no_hp'    => $request->no_hp,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->jsonResponse(true, 'Registrasi berhasil.', [
            'user'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user dan return Bearer token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return $this->jsonResponse(false, 'Email atau password salah.', null, 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // Hapus semua token lama, lalu buat token baru
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->jsonResponse(true, 'Login berhasil.', [
            'user'  => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Logout user — hapus token yang sedang digunakan.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->jsonResponse(true, 'Logout berhasil.');
    }

    /**
     * Ambil data user yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->jsonResponse(true, 'Data user berhasil diambil.', [
            'user' => new UserResource($request->user()),
        ]);
    }
}
