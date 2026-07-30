<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->is_admin) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Accès non autorisé.',
            ], 403);
        }
        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Compte suspendu.',
            ], 403);
        }
        return $next($request);
    }
}
