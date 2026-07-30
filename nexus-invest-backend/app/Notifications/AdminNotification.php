<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class AdminNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $body,
        public ?string $targetType = null,
        public ?int $targetPackId = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        Log::channel('audit')->info('Admin notification sent', [
            'target_user_id' => $notifiable->id,
            'target_email' => $notifiable->email,
            'title' => $this->title,
            'body' => $this->body,
            'target_type' => $this->targetType,
            'target_pack_id' => $this->targetPackId,
        ]);

        return [
            'title' => $this->title,
            'body' => $this->body,
            'target_type' => $this->targetType,
            'target_pack_id' => $this->targetPackId,
        ];
    }
}
