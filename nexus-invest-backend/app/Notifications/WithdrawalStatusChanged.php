<?php

namespace App\Notifications;

use App\Models\WithdrawalRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WithdrawalStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public WithdrawalRequest $withdrawal
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $statusLabels = [
            'pending' => 'en attente',
            'processing' => 'en cours de traitement',
            'completed' => 'effectué',
            'rejected' => 'refusé',
            'cancelled' => 'annulé',
        ];

        $label = $statusLabels[$this->withdrawal->status] ?? $this->withdrawal->status;

        $message = (new MailMessage)
            ->subject('Statut de retrait mis à jour — Nexus Invest')
            ->greeting('Bonjour ' . $notifiable->first_name . ',')
            ->line('Le statut de votre demande de retrait a été mis à jour.')
            ->line('Montant : ' . number_format($this->withdrawal->amount, 0, ',', ' ') . ' FCFA')
            ->line('Statut : ' . ucfirst($label))
            ->salutation('L\'équipe Nexus Invest');

        if ($this->withdrawal->status === 'completed') {
            $message->line('Votre retrait a été effectué avec succès.');
        } elseif ($this->withdrawal->status === 'rejected') {
            $message->line('Votre demande de retrait a été refusée. Contactez le support pour plus d\'informations.');
        }

        return $message;
    }
}
