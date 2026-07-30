<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\WalletResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        try {
            $wallet = $request->user()->wallet;

            if (!$wallet) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Portefeuille non trouvé.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => new WalletResource($wallet),
                'message' => 'Détails du portefeuille récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération du portefeuille.',
            ], 500);
        }
    }

    public function transactions(Request $request): JsonResponse
    {
        try {
            $transactions = $request->user()
                ->transactions()
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => TransactionResource::collection($transactions),
                'message' => 'Transactions récupérées avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des transactions.',
            ], 500);
        }
    }
}
