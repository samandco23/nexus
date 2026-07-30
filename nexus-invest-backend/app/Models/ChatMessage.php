<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'chat_room_id',
        'user_id',
        'message',
    ];

    protected $hidden = [];

    protected $appends = [
        'user_name',
        'user_avatar',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class, 'chat_room_id');
    }

    public function getUserNameAttribute(): string
    {
        return $this->user ? $this->user->first_name . ' ' . $this->user->last_name : 'Utilisateur supprimé';
    }

    public function getUserAvatarAttribute(): ?string
    {
        return null;
    }
}
