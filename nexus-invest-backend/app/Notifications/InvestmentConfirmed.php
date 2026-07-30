<?php

namespace App\Notifications;

use App\Models\Investment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvestmentConfirmed extends Notification
{
    use Queueable;

    public function __construct(
        public Investment $investment
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $pack = $this->investment->pack;

        return (new MailMessage)
            ->subject('Investissement confirmé — Nexus Invest')
            ->greeting('Bonjour ' . $notifiable->first_name . ',')
            ->line('Votre investissement a été confirmé avec succès.')
            ->line('Pack : ' . ($pack->name ?? 'N/A'))
            ->line('Montant investi : ' . number_format($this->investment->amount_invested, 0, ',', ' ') . ' FCFA')
            ->line('Rendement attendu : ' . number_format($this->investment->expected_return, 0, ',', ' ') . ' FCFA')
            ->line('Date de début : ' . $this->investment->start_date->format('d/m/Y'))
            ->line('Date de fin : ' . $this->investment->end_date->format('d/m/Y'))
            ->action('Voir mon investissement', config('app.frontend_url') . '/dashboard/investir/' . $this->investment->id)
            ->line('Les gains seront versés automatiquement chaque semaine.')
            ->salutation('L\'équipe Nexus Invest');
    }
}
