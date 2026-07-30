<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvestmentPackResource;
use App\Models\InvestmentPack;
use Illuminate\Http\JsonResponse;

class InvestmentPackController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $packs = InvestmentPack::where('is_active', true)->orderBy('min_amount')->get();

            return response()->json([
                'success' => true,
                'data' => InvestmentPackResource::collection($packs),
                'message' => 'Packs d\'investissement récupérés avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des packs.',
            ], 500);
        }
    }
}
