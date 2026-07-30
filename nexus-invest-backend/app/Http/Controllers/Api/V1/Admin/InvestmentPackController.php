<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvestmentPackResource;
use App\Models\ActivityLog;
use App\Models\InvestmentPack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InvestmentPackController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $packs = InvestmentPack::orderBy('display_order')->get();

            return response()->json([
                'success' => true,
                'data' => InvestmentPackResource::collection($packs),
                'message' => 'Packs récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des packs.',
            ], 500);
        }
    }

    public function show(InvestmentPack $investmentPack): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => new InvestmentPackResource($investmentPack),
                'message' => 'Détails du pack récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération du pack.',
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'min_amount' => 'required|numeric|min:0',
                'duration_days' => 'required|integer|min:1',
                'roi_percentage' => 'required|numeric|min:0',
                'loyalty_bonus_percentage' => 'nullable|numeric|min:0',
                'color_code' => 'required|string|max:7',
                'icon_name' => 'required|string|max:50',
                'display_order' => 'required|integer|min:0',
                'is_active' => 'nullable|boolean',
            ]);

            $pack = InvestmentPack::create($validated);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'type' => 'admin_action',
                'description' => 'Création du pack ' . $pack->name,
                'metadata' => ['pack_id' => $pack->id],
            ]);

            Log::channel('audit')->info('Pack créé', [
                'admin_id' => $request->user()->id,
                'pack_id' => $pack->id,
                'name' => $pack->name,
            ]);

            return response()->json([
                'success' => true,
                'data' => new InvestmentPackResource($pack),
                'message' => 'Pack créé avec succès.',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Données invalides.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la création du pack.',
            ], 500);
        }
    }

    public function update(Request $request, InvestmentPack $investmentPack): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'min_amount' => 'required|numeric|min:0',
                'duration_days' => 'required|integer|min:1',
                'roi_percentage' => 'required|numeric|min:0',
                'loyalty_bonus_percentage' => 'nullable|numeric|min:0',
                'color_code' => 'required|string|max:7',
                'icon_name' => 'required|string|max:50',
                'display_order' => 'required|integer|min:0',
                'is_active' => 'nullable|boolean',
            ]);

            $investmentPack->update($validated);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'type' => 'admin_action',
                'description' => 'Modification du pack ' . $investmentPack->name,
                'metadata' => ['pack_id' => $investmentPack->id],
            ]);

            Log::channel('audit')->info('Pack modifié', [
                'admin_id' => $request->user()->id,
                'pack_id' => $investmentPack->id,
                'name' => $investmentPack->name,
            ]);

            return response()->json([
                'success' => true,
                'data' => new InvestmentPackResource($investmentPack->fresh()),
                'message' => 'Pack modifié avec succès.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Données invalides.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la modification du pack.',
            ], 500);
        }
    }

    public function destroy(Request $request, InvestmentPack $investmentPack): JsonResponse
    {
        try {
            if ($investmentPack->investments()->exists()) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Impossible de supprimer un pack qui a des investissements actifs.',
                ], 400);
            }

            $name = $investmentPack->name;
            $investmentPack->delete();

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'type' => 'admin_action',
                'description' => 'Suppression du pack ' . $name,
                'metadata' => ['pack_name' => $name],
            ]);

            Log::channel('audit')->info('Pack supprimé', [
                'admin_id' => $request->user()->id,
                'pack_name' => $name,
            ]);

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Pack supprimé avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la suppression du pack.',
            ], 500);
        }
    }
}
