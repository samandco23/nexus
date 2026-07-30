<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $users = User::with('wallet')
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => UserResource::collection($users),
                'message' => 'Utilisateurs récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des utilisateurs.',
            ], 500);
        }
    }

    public function show(User $user): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new UserResource($user->load('wallet', 'investments.pack', 'referralEarnings')),
                'message' => 'Détails de l\'utilisateur récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des détails.',
            ], 500);
        }
    }

    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        try {
            if ($user->is_admin && $user->status === 'active') {
                $adminCount = \App\Models\User::where('is_admin', true)->where('status', 'active')->count();
                if ($adminCount <= 1) {
                    return response()->json([
                        'success' => false,
                        'data' => null,
                        'message' => 'Impossible de suspendre le dernier administrateur.',
                    ], 400);
                }
            }

            if ($request->user()->id === $user->id) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Vous ne pouvez pas modifier votre propre statut.',
                ], 400);
            }

            $user->status = $user->status === 'active' ? 'suspended' : 'active';
            $user->save();

            $adminName = request()->user()->first_name . ' ' . request()->user()->last_name;

            ActivityLog::create([
                'user_id' => request()->user()->id,
                'type' => 'admin_action',
                'description' => $adminName . ' a ' . ($user->status === 'active' ? 'réactivé' : 'suspendu') . ' le compte de ' . ($user->first_name . ' ' . $user->last_name),
                'metadata' => ['target_user_id' => $user->id, 'new_status' => $user->status],
            ]);

            Log::channel('audit')->info('Statut utilisateur modifié', [
                'admin_id' => request()->user()->id,
                'target_user_id' => $user->id,
                'new_status' => $user->status,
            ]);

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
                'message' => 'Statut mis à jour.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la mise à jour.',
            ], 500);
        }
    }
}
