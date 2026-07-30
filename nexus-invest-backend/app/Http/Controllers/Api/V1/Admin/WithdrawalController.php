<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\WithdrawalRequestResource;
use App\Models\ActivityLog;
use App\Models\WithdrawalRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WithdrawalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $withdrawals = WithdrawalRequest::with('user')
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => WithdrawalRequestResource::collection($withdrawals),
                'message' => 'Demandes de retrait récupérées.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération.',
            ], 500);
        }
    }

    public function approve(WithdrawalRequest $withdrawalRequest): JsonResponse
    {
        try {
            if ($withdrawalRequest->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Cette demande a déjà été traitée.',
                ], 400);
            }

            \Illuminate\Support\Facades\DB::transaction(function () use ($withdrawalRequest) {
                $withdrawalRequest->lockForUpdate()->update(['status' => 'processing']);
            });

            $adminName = request()->user()->first_name . ' ' . request()->user()->last_name;

            ActivityLog::create([
                'user_id' => request()->user()->id,
                'type' => 'withdrawal_approved',
                'description' => $adminName . ' a approuvé un retrait de ' . number_format($withdrawalRequest->amount, 0, ',', ' ') . ' FCFA',
                'metadata' => ['withdrawal_id' => $withdrawalRequest->id, 'target_user_id' => $withdrawalRequest->user_id, 'amount' => $withdrawalRequest->amount],
            ]);

            Log::channel('audit')->info('Retrait approuvé', [
                'admin_id' => request()->user()->id,
                'withdrawal_id' => $withdrawalRequest->id,
                'user_id' => $withdrawalRequest->user_id,
                'amount' => $withdrawalRequest->amount,
            ]);

            return response()->json([
                'success' => true,
                'data' => new WithdrawalRequestResource($withdrawalRequest),
                'message' => 'Retrait approuvé.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de l\'approbation.',
            ], 500);
        }
    }

    public function reject(WithdrawalRequest $withdrawalRequest): JsonResponse
    {
        try {
            if ($withdrawalRequest->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Cette demande a déjà été traitée.',
                ], 400);
            }

            \Illuminate\Support\Facades\DB::transaction(function () use ($withdrawalRequest) {
                $withdrawalRequest->lockForUpdate()->update(['status' => 'rejected']);
                $wallet = $withdrawalRequest->user->wallet()->lockForUpdate()->first();
                if ($wallet) {
                    $wallet->increment('withdrawable_balance', $withdrawalRequest->amount);
                }
            });

            $adminName = request()->user()->first_name . ' ' . request()->user()->last_name;

            ActivityLog::create([
                'user_id' => request()->user()->id,
                'type' => 'withdrawal_rejected',
                'description' => $adminName . ' a rejeté un retrait de ' . number_format($withdrawalRequest->amount, 0, ',', ' ') . ' FCFA',
                'metadata' => ['withdrawal_id' => $withdrawalRequest->id, 'target_user_id' => $withdrawalRequest->user_id, 'amount' => $withdrawalRequest->amount],
            ]);

            Log::channel('audit')->info('Retrait rejeté', [
                'admin_id' => request()->user()->id,
                'withdrawal_id' => $withdrawalRequest->id,
                'user_id' => $withdrawalRequest->user_id,
                'amount' => $withdrawalRequest->amount,
            ]);

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Retrait rejeté. Le montant a été remis sur le solde.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors du rejet.',
            ], 500);
        }
    }
}
