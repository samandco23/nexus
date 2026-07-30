<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $notifications = $request->user()
                ->notifications()
                ->latest()
                ->paginate(20);

            $unreadCount = $request->user()->unreadNotifications()->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications->through(function ($n) {
                        return [
                            'id' => $n->id,
                            'title' => $n->data['title'] ?? '',
                            'body' => $n->data['body'] ?? '',
                            'read_at' => $n->read_at,
                            'created_at' => $n->created_at,
                        ];
                    }),
                    'unread_count' => $unreadCount,
                ],
                'message' => 'Notifications récupérées.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération.',
            ], 500);
        }
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        try {
            $notification = $request->user()
                ->notifications()
                ->where('id', $id)
                ->firstOrFail();

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Notification marquée comme lue.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Notification non trouvée.',
            ], 404);
        }
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Toutes les notifications marquées comme lues.',
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->unreadNotifications()->count();

        return response()->json([
            'success' => true,
            'data' => ['count' => $count],
            'message' => 'Compte récupéré.',
        ]);
    }
}
