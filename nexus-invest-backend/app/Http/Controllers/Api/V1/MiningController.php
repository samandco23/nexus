<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MiningLogResource;
use App\Models\SystemSetting;
use App\Services\MiningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MiningController extends Controller
{
    private MiningService $miningService;

    public function __construct(MiningService $miningService)
    {
        $this->miningService = $miningService;
    }

    public function status(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $status = $this->miningService->status($user);
            $wallet = $user->wallet;
            $tokenValue = (float) SystemSetting::getValue('token_value_xaf', 10);

            return response()->json([
                'success' => true,
                'data' => array_merge($status, [
                    'token_balance' => $wallet?->token_balance ?? 0,
                    'fiat_balance' => $wallet?->fiat_balance ?? 0,
                    'token_value_xaf' => $tokenValue,
                    'rate_per_hour' => (float) SystemSetting::getValue('mining_base_rate', 10),
                ]),
                'message' => 'Statut de minage recupere.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la recuperation du statut.',
            ], 500);
        }
    }

    public function start(Request $request): JsonResponse
    {
        try {
            $log = $this->miningService->startMining($request->user());
            return response()->json([
                'success' => true,
                'data' => new MiningLogResource($log),
                'message' => 'Minage demarre ! Revenez dans 24h pour recuperer vos gains.',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors du demarrage du minage.',
            ], 500);
        }
    }

    public function claim(Request $request): JsonResponse
    {
        try {
            $result = $this->miningService->claimMining($request->user());
            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => number_format($result['tokens_mined'], 4) . ' NEX recuperes !',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la recuperation des gains.',
            ], 500);
        }
    }

    public function history(Request $request): JsonResponse
    {
        try {
            $logs = $this->miningService->history($request->user(), 7);
            return response()->json([
                'success' => true,
                'data' => MiningLogResource::collection($logs),
                'message' => 'Historique recupere.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => "Erreur lors de la recuperation de l'historique.",
            ], 500);
        }
    }

    public function convertTokens(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'token_amount' => 'required|numeric|min:0.01',
            ]);

            $result = $this->miningService->convertTokens(
                $request->user(),
                $validated['token_amount']
            );

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => $result['message'],
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Conversion reussie ! ' . number_format($result['fiat_amount'], 2) . ' FCFA credits.',
            ]);
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
                'message' => 'Erreur lors de la conversion.',
            ], 500);
        }
    }
}
