<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Untuk API, tidak perlu redirect ke login page.
     * Return null agar response 401 Unauthenticated dikirim.
     */
    protected function redirectTo(Request $request): ?string
    {
        return null;
    }
}
