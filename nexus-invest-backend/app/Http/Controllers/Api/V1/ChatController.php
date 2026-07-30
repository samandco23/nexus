<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ChatController extends Controller
{
    public function rooms(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $rooms = [];

            $generalRoom = ChatRoom::where('type', 'general')->first();
            if ($generalRoom) {
                $rooms[] = $this->formatRoom($generalRoom, $user);
            }

            $hasReferrals = $user->referredUsers()->exists();
            if ($hasReferrals) {
                $referralRoom = ChatRoom::firstOrCreate(
                    [
                        'type' => 'referral',
                        'referral_owner_id' => $user->id,
                    ],
                    [
                        'name' => 'Parrainage - ' . $user->first_name . ' ' . $user->last_name,
                        'is_active' => true,
                    ]
                );
                $rooms[] = $this->formatRoom($referralRoom, $user);
            }

            return response()->json([
                'success' => true,
                'data' => $rooms,
                'message' => 'Salons récupérés avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des salons.',
            ], 500);
        }
    }

    public function messages(Request $request, ChatRoom $room): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$this->canAccessRoom($user, $room)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Accès non autorisé à ce salon.',
                ], 403);
            }

            $messages = $room->messages()
                ->with('user')
                ->latest()
                ->paginate(50);

            return response()->json([
                'success' => true,
                'data' => $messages,
                'message' => 'Messages récupérés avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des messages.',
            ], 500);
        }
    }

    public function send(Request $request, ChatRoom $room): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$this->canAccessRoom($user, $room)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Accès non autorisé à ce salon.',
                ], 403);
            }

            $validated = $request->validate([
                'message' => 'required|string|min:1|max:2000',
            ]);

            $message = ChatMessage::create([
                'chat_room_id' => $room->id,
                'user_id' => $user->id,
                'message' => $validated['message'],
            ]);

            $message->load('user');

            return response()->json([
                'success' => true,
                'data' => $message,
                'message' => 'Message envoyé avec succès.',
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
                'message' => 'Erreur lors de l\'envoi du message.',
            ], 500);
        }
    }

    private function formatRoom(ChatRoom $room, User $user): array
    {
        $lastMessage = $room->messages()->with('user')->latest()->first();

        return [
            'id' => $room->id,
            'type' => $room->type,
            'name' => $room->name,
            'last_message' => $lastMessage ? [
                'message' => $lastMessage->message,
                'user_name' => $lastMessage->user_name,
                'created_at' => $lastMessage->created_at,
            ] : null,
            'unread_count' => 0,
        ];
    }

    private function canAccessRoom(User $user, ChatRoom $room): bool
    {
        if ($room->type === 'general') {
            return true;
        }

        if ($room->type === 'referral') {
            if ($room->referral_owner_id === $user->id) {
                return true;
            }

            return $user->referred_by_id === $room->referral_owner_id;
        }

        return false;
    }
}
