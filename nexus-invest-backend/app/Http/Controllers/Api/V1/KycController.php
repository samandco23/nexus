<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KycDocument;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class KycController extends Controller
{
    use LogsActivity;

    public function status(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $documents = KycDocument::where('user_id', $user->id)->get();

            $pending = $documents->where('status', 'pending')->count();
            $approved = $documents->where('status', 'approved')->count();
            $rejected = $documents->where('status', 'rejected')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'kyc_level' => $user->kyc_level,
                    'documents' => $documents->map(fn ($d) => [
                        'id' => $d->id,
                        'type' => $d->type,
                        'status' => $d->status,
                        'admin_notes' => $d->admin_notes,
                        'created_at' => $d->created_at,
                        'reviewed_at' => $d->reviewed_at,
                    ]),
                    'summary' => [
                        'total' => $documents->count(),
                        'pending' => $pending,
                        'approved' => $approved,
                        'rejected' => $rejected,
                    ],
                ],
                'message' => 'Statut KYC récupéré.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération.',
            ], 500);
        }
    }

    public function upload(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:identity_card,passport,proof_of_address,selfie',
                'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            ]);

            $user = $request->user();

            $path = $request->file('file')->store('kyc/' . $user->id, 'public');

            $doc = KycDocument::create([
                'user_id' => $user->id,
                'type' => $validated['type'],
                'file_path' => $path,
                'status' => 'pending',
            ]);

            $this->logActivity(
                'kyc_submitted',
                $user->first_name . ' ' . $user->last_name . ' a soumis un document KYC (' . $validated['type'] . ')',
                $user->id,
                ['document_id' => $doc->id, 'type' => $validated['type']]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $doc->id,
                    'type' => $doc->type,
                    'status' => $doc->status,
                ],
                'message' => 'Document envoyé pour vérification.',
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
                'message' => 'Erreur lors de l\'upload.',
            ], 500);
        }
    }
}
