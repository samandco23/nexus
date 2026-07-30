<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->status !== 'active') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Compte suspendu. Veuillez contacter l\'administration.',
            ], 403);
        }

        return $next($request);
    }
}
