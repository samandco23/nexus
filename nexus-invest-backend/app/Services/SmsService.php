<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use KyaSms\KyaSms;
use KyaSms\Exceptions\KyaSmsException;

class SmsService
{
    protected ?KyaSms $client;
    protected bool $enabled;

    public function __construct()
    {
        $apiKey = config('services.kya_sms.api_key');
        $this->enabled = !empty($apiKey);

        if ($this->enabled) {
            try {
                $this->client = new KyaSms($apiKey);
            } catch (KyaSmsException $e) {
                Log::channel('audit')->warning('KYA SMS init failed', [
                    'error' => $e->getMessage(),
                ]);
                $this->client = null;
                $this->enabled = false;
            }
        } else {
            $this->client = null;
        }
    }

    public function send(string $to, string $message): bool
    {
        if (!$this->enabled || !$this->client) {
            Log::channel('audit')->info('SMS simulate (KYA SMS non configuré)', [
                'to' => $to,
                'message' => $message,
            ]);
            return false;
        }

        try {
            $response = $this->client->sms()->sendSimple('NexusInvest', $to, $message);

            if ($response->isSuccess()) {
                Log::channel('audit')->info('SMS sent via KYA SMS', [
                    'to' => $to,
                    'message_id' => $response->getMessageId(),
                ]);
                return true;
            }

            Log::channel('audit')->warning('KYA SMS returned non-success', [
                'to' => $to,
                'reason' => $response->getReason(),
            ]);
            return false;

        } catch (KyaSmsException $e) {
            Log::channel('audit')->error('KYA SMS failed', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
