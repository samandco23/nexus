<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;

class Recaptcha implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) || empty($value)) {
            $fail('Le CAPTCHA est requis.');
            return;
        }

        $secret = config('services.recaptcha.secret');

        if (!$secret || $secret === 'your-recaptcha-secret-key' || app()->environment('testing')) {
            return;
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $value,
        ]);

        $body = $response->json();

        if (!($body['success'] ?? false)) {
            $fail('La vérification CAPTCHA a échoué. Veuillez réessayer.');
        }
    }
}
