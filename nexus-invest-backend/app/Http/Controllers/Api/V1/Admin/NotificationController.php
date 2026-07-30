<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvestmentPack;
use App\Models\User;
use App\Notifications\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class NotificationController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'body' => 'required|string|max:5000',
                'target' => 'required|in:all,pack',
                'pack_id' => 'required_if:target,pack|integer|exists:investment_packs,id',
            ]);

            $admin = $request->user();

            if ($validated['target'] === 'all') {
                $users = User::where('status', 'active')->cursor();
                $count = 0;
                foreach ($users as $user) {
                    $user->notify(new AdminNotification(
                        $validated['title'],
                        $validated['body'],
                        'all',
                        null,
                    ));
                    $count++;
                }
            } else {
                $packId = $validated['pack_id'];
                $pack = InvestmentPack::findOrFail($packId);
                $users = User::whereHas('investments', function ($q) use ($packId) {
                    $q->where('pack_id', $packId)->where('status', 'active');
                })->where('status', 'active')->cursor();
                $count = 0;
                foreach ($users as $user) {
                    $user->notify(new AdminNotification(
                        $validated['title'],
                        $validated['body'],
                        'pack',
                        $packId,
                    ));
                    $count++;
                }
            }

            Log::channel('audit')->info('Admin sent notification', [
                'admin_id' => $admin->id,
                'title' => $validated['title'],
                'target' => $validated['target'],
                'pack_id' => $validated['pack_id'] ?? null,
                'recipient_count' => $count,
            ]);

            return response()->json([
                'success' => true,
                'data' => ['recipient_count' => $count],
                'message' => "Notification envoyée à {$count} utilisateur(s).",
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
                'message' => 'Erreur lors de l\'envoi.',
            ], 500);
        }
    }
}
