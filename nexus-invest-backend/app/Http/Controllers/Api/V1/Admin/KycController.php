<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\KycDocument;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class KycController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $status = $request->query('status', 'pending');
            $documents = KycDocument::with('user')
                ->where('status', $status)
                ->latest()
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $documents,
                'message' => 'Documents KYC récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération.',
            ], 500);
        }
    }

    public function approve(Request $request, KycDocument $kycDocument): JsonResponse
    {
        try {
            $admin = $request->user();

            if ($kycDocument->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Ce document a déjà été traité.',
                ], 400);
            }

            DB::transaction(function () use ($kycDocument, $admin) {
                $kycDocument->update([
                    'status' => 'approved',
                    'reviewed_by' => $admin->id,
                    'reviewed_at' => now(),
                ]);

                $user = $kycDocument->user;
                $approvedCount = KycDocument::where('user_id', $user->id)
                    ->where('status', 'approved')
                    ->count();

                $newLevel = min($approvedCount, 3);
                if ($newLevel > $user->kyc_level) {
                    $user->update(['kyc_level' => $newLevel]);
                }
            });

            ActivityLog::create([
                'user_id' => $admin->id,
                'type' => 'kyc_approved',
                'description' => $admin->first_name . ' ' . $admin->last_name . ' a approuvé un document KYC',
                'metadata' => ['document_id' => $kycDocument->id, 'target_user_id' => $kycDocument->user_id],
            ]);

            Log::channel('audit')->info('KYC document approved', [
                'admin_id' => $admin->id,
                'document_id' => $kycDocument->id,
                'user_id' => $kycDocument->user_id,
            ]);

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Document approuvé.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de l\'approbation.',
            ], 500);
        }
    }

    public function reject(Request $request, KycDocument $kycDocument): JsonResponse
    {
        try {
            $validated = $request->validate([
                'admin_notes' => 'required|string|max:1000',
            ]);

            $admin = $request->user();

            if ($kycDocument->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Ce document a déjà été traité.',
                ], 400);
            }

            $kycDocument->update([
                'status' => 'rejected',
                'admin_notes' => $validated['admin_notes'],
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            ActivityLog::create([
                'user_id' => $admin->id,
                'type' => 'kyc_rejected',
                'description' => $admin->first_name . ' ' . $admin->last_name . ' a refusé un document KYC',
                'metadata' => ['document_id' => $kycDocument->id, 'target_user_id' => $kycDocument->user_id, 'notes' => $validated['admin_notes']],
            ]);

            Log::channel('audit')->info('KYC document rejected', [
                'admin_id' => $admin->id,
                'document_id' => $kycDocument->id,
                'user_id' => $kycDocument->user_id,
                'notes' => $validated['admin_notes'],
            ]);

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Document refusé.',
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
                'message' => 'Erreur lors du refus.',
            ], 500);
        }
    }
}
