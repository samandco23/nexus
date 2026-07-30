<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'chat_room_id' => $this->chat_room_id,
            'user_id' => $this->user_id,
            'message' => e($this->message),
            'user_name' => $this->user_name,
            'user_avatar' => $this->user_avatar,
            'created_at' => $this->created_at,
        ];
    }
}
