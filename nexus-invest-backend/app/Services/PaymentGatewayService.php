<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentGatewayService
{
    private ?string $stripeSecretKey;

    public function __construct()
    {
        $this->stripeSecretKey = config('services.stripe.secret');
        if ($this->stripeSecretKey) {
            Stripe::setApiKey($this->stripeSecretKey);
        }
    }

    public function createPaymentIntent(float $amount, string $currency = 'usd', array $metadata = []): array
    {
        try {
            if ($this->stripeSecretKey) {
                $intent = PaymentIntent::create([
                    'amount' => (int) ($amount * 100),
                    'currency' => strtolower($currency),
                    'metadata' => $metadata,
                    'automatic_payment_methods' => ['enabled' => true],
                ]);

                return [
                    'success' => true,
                    'client_secret' => $intent->client_secret,
                    'intent_id' => $intent->id,
                ];
            }

            Log::channel('audit')->warning('Payment attempted without Stripe keys configured');
            return [
                'success' => false,
                'message' => 'Paiement par carte non disponible. Veuillez utiliser le portefeuille.',
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe payment intent creation failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors de la création du paiement: ' . $e->getMessage(),
            ];
        }
    }

    public function verifyPayment(string $providerReference, string $provider = 'stripe'): array
    {
        try {
            if ($provider === 'stripe' && $this->stripeSecretKey) {
                $intent = PaymentIntent::retrieve($providerReference);
                return [
                    'success' => $intent->status === 'succeeded',
                    'status' => $intent->status,
                    'amount' => $intent->amount / 100,
                    'currency' => $intent->currency,
                ];
            }

            return [
                'success' => false,
                'status' => 'failed',
                'message' => 'Clés Stripe non configurées.',
            ];
        } catch (ApiErrorException $e) {
            Log::error('Payment verification failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur de vérification du paiement: ' . $e->getMessage(),
            ];
        }
    }

    public function processRefund(Transaction $transaction): array
    {
        try {
            if ($transaction->payment_provider === 'stripe' && $this->stripeSecretKey && $transaction->provider_reference) {
                $intent = PaymentIntent::retrieve($transaction->provider_reference);
                $intent->cancel();

                return [
                    'success' => true,
                    'message' => 'Remboursement effectué avec succès.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Remboursement non disponible : clés Stripe non configurées.',
            ];
        } catch (ApiErrorException $e) {
            Log::error('Refund failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur lors du remboursement: ' . $e->getMessage(),
            ];
        }
    }

    public function initiateFlutterwavePayment(float $amount, string $currency, array $customer, array $metadata = []): array
    {
        try {
            $secretKey = config('services.flutterwave.secret');
            if (!$secretKey) {
                Log::channel('audit')->warning('Flutterwave payment attempted without keys configured');
                return [
                    'success' => false,
                    'message' => 'Paiement Flutterwave non disponible. Veuillez utiliser le portefeuille.',
                ];
            }

            $payload = [
                'tx_ref' => 'NX-' . Str::uuid(),
                'amount' => $amount,
                'currency' => $currency,
                'redirect_url' => config('services.flutterwave.redirect_url', config('app.url') . '/api/v1/investments/callback'),
                'customer' => $customer,
                'meta' => $metadata,
                'customizations' => [
                    'title' => 'Nexus Invest - Dépôt',
                    'description' => 'Dépôt sur votre compte Nexus Invest',
                ],
            ];

            $response = \Illuminate\Support\Facades\Http::withToken($secretKey)
                ->post('https://api.flutterwave.com/v3/payments', $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'payment_link' => $data['data']['link'] ?? null,
                    'reference' => $payload['tx_ref'],
                ];
            }

            return [
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement Flutterwave.',
            ];
        } catch (\Exception $e) {
            Log::error('Flutterwave payment initiation failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erreur de paiement: ' . $e->getMessage(),
            ];
        }
    }

    public function verifyFlutterwavePayment(string $transactionId): array
    {
        try {
            $secretKey = config('services.flutterwave.secret');
            if (!$secretKey) {
                return ['success' => false, 'status' => 'failed', 'message' => 'Clés Flutterwave non configurées.'];
            }

            $response = \Illuminate\Support\Facades\Http::withToken($secretKey)
                ->get("https://api.flutterwave.com/v3/transactions/{$transactionId}/verify");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => $data['data']['status'] === 'successful',
                    'status' => $data['data']['status'],
                ];
            }

            return ['success' => false, 'status' => 'failed'];
        } catch (\Exception $e) {
            Log::error('Flutterwave verification failed: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Erreur de vérification.'];
        }
    }
}
