<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WithdrawalRequestResource;
use App\Models\ActivityLog;
use App\Models\SystemSetting;
use App\Models\WithdrawalRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class WithdrawalController extends Controller
{
    use LogsActivity;

    public function index(Request $request): JsonResponse
    {
        try {
            $withdrawals = WithdrawalRequest::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => WithdrawalRequestResource::collection($withdrawals),
                'message' => 'Demandes de retrait récupérées.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des demandes de retrait.',
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:1',
                'method' => 'required|in:stripe,flutterwave_mobile_money,flutterwave_bank_transfer',
                'recipient_details' => 'required|array',
                'recipient_details.account_name' => 'required_if:method,flutterwave_bank_transfer|string',
                'recipient_details.account_number' => 'required_if:method,flutterwave_bank_transfer|string',
                'recipient_details.bank_code' => 'required_if:method,flutterwave_bank_transfer|string',
                'recipient_details.phone' => 'required_if:method,flutterwave_mobile_money|string',
                'recipient_details.network' => 'required_if:method,flutterwave_mobile_money|string',
            ]);

            $minAmount = (float) SystemSetting::getValue('withdrawal_min_amount', 5000);
            $user = $request->user();
            $wallet = $user->wallet;

            if (!$wallet) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Portefeuille non trouvé.',
                ], 404);
            }

            if ($validated['amount'] < $minAmount) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => "Le montant minimum de retrait est de " . number_format($minAmount, 0, ',', ' ') . " FCFA.",
                ], 422);
            }

            if (!$wallet || $wallet->withdrawable_balance < $validated['amount']) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Solde insuffisant.',
                ], 400);
            }

            $recipientDetails = $request->input('recipient_details', []);
            $withdrawal = DB::transaction(function () use ($user, $validated, $recipientDetails) {
                $wallet = $user->wallet()->lockForUpdate()->first();

                if (!$wallet || $wallet->withdrawable_balance < $validated['amount']) {
                    throw new \RuntimeException('Solde insuffisant.');
                }

                $wd = WithdrawalRequest::create([
                    'user_id' => $user->id,
                    'amount' => $validated['amount'],
                    'currency' => 'XAF',
                    'method' => $validated['method'],
                    'recipient_details' => $recipientDetails,
                    'status' => 'pending',
                ]);

                $wallet->decrement('withdrawable_balance', $validated['amount']);

                return $wd;
            });

            $this->logActivity(
                'withdrawal_request',
                $request->user()->first_name . ' ' . $request->user()->last_name . ' a demandé un retrait de ' . number_format($validated['amount'], 0, ',', ' ') . ' FCFA',
                $request->user()->id,
                ['amount' => $validated['amount'], 'method' => $validated['method'], 'withdrawal_id' => $withdrawal->id]
            );

            return response()->json([
                'success' => true,
                'data' => new WithdrawalRequestResource($withdrawal),
                'message' => 'Demande de retrait soumise avec succès. Elle sera traitée sous 24-48h.',
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la création de la demande de retrait.',
            ], 500);
        }
    }

    public function cancel(Request $request, WithdrawalRequest $withdrawalRequest): JsonResponse
    {
        try {
            if ($withdrawalRequest->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Demande de retrait non trouvée.',
                ], 404);
            }

            if ($withdrawalRequest->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Seules les demandes en attente peuvent être annulées.',
                ], 400);
            }

            DB::transaction(function () use ($withdrawalRequest, $request) {
                $withdrawalRequest->lockForUpdate();
                $wallet = $request->user()->wallet()->lockForUpdate()->first();

                $withdrawalRequest->update(['status' => 'rejected']);

                if ($wallet) {
                    $wallet->increment('withdrawable_balance', $withdrawalRequest->amount);
                }
            });

            $this->logActivity(
                'withdrawal_rejected',
                $request->user()->first_name . ' ' . $request->user()->last_name . ' a annulé sa demande de retrait de ' . number_format($withdrawalRequest->amount, 0, ',', ' ') . ' FCFA',
                $request->user()->id,
                ['amount' => $withdrawalRequest->amount, 'withdrawal_id' => $withdrawalRequest->id]
            );

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Demande de retrait annulée. Le montant a été remis sur votre solde.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de l\'annulation de la demande.',
            ], 500);
        }
    }
}
