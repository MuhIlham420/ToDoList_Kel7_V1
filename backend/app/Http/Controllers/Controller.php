<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Format response JSON standar.
     *
     * @param  bool   $success
     * @param  string $message
     * @param  mixed  $data
     * @param  int    $statusCode
     * @return \Illuminate\Http\JsonResponse
     */
    protected function jsonResponse(bool $success, string $message, mixed $data = null, int $statusCode = 200)
    {
        $response = [
            'success' => $success,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }
}
