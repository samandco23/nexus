<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class SendEmailOtp extends Notification
{
    use Queueable;

    public function __construct(
        public string $code
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        Log::channel('audit')->info('EMAIL_OTP', [
            'user_id' => $notifiable->id,
            'email' => $notifiable->email,
            'code' => $this->code,
        ]);

        return (new MailMessage)
            ->subject('Vérification de votre adresse email — Nexus Invest')
            ->markdown('emails.verify-email', [
                'first_name' => $notifiable->first_name,
                'code' => $this->code,
            ]);
    }
}
