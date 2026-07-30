<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReferralController extends Controller
{
    private ReferralService $referralService;

    public function __construct(ReferralService $referralService)
    {
        $this->referralService = $referralService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $referrals = $this->referralService->getReferredUsersList($request->user());

            return response()->json([
                'success' => true,
                'data' => $referrals,
                'message' => 'Liste des filleuls récupérée.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des filleuls.',
            ], 500);
        }
    }

    public function tree(Request $request): JsonResponse
    {
        try {
            $tree = $this->referralService->getReferralTree($request->user(), 3);

            return response()->json([
                'success' => true,
                'data' => $tree,
                'message' => 'Arbre de parrainage récupéré.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération de l\'arbre de parrainage.',
            ], 500);
        }
    }

    public function updateCode(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'referral_code' => 'required|string|min:4|max:20|alpha_num|unique:users,referral_code,' . $user->id,
            ]);

            $user->update(['referral_code' => $validated['referral_code']]);

            return response()->json([
                'success' => true,
                'data' => ['referral_code' => $user->referral_code],
                'message' => 'Code de parrainage mis à jour avec succès.',
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
                'message' => 'Erreur lors de la mise à jour du code.',
            ], 500);
        }
    }
}
