<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvestmentResource;
use App\Jobs\ProcessReferralBonus;
use App\Models\Investment;
use App\Models\InvestmentPack;
use App\Models\Transaction;
use App\Services\PaymentGatewayService;
use App\Traits\LogsActivity;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class InvestmentController extends Controller
{
    use LogsActivity;

    private PaymentGatewayService $paymentGateway;

    public function __construct(PaymentGatewayService $paymentGateway)
    {
        $this->paymentGateway = $paymentGateway;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $investments = Investment::with('pack')
                ->where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => InvestmentResource::collection($investments),
                'message' => 'Investissements récupérés avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des investissements.',
            ], 500);
        }
    }

    public function show(Request $request, Investment $investment): JsonResponse
    {
        try {
            if ($investment->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Investissement non trouvé.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => new InvestmentResource($investment->load('pack')),
                'message' => 'Détails de l\'investissement récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des détails.',
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'pack_id' => 'required|integer|exists:investment_packs,id,is_active,1',
                'amount' => 'required|numeric|min:1',
                'payment_provider' => 'required|in:stripe,flutterwave,wallet',
            ]);

            $pack = InvestmentPack::findOrFail($validated['pack_id']);
            $user = $request->user();

            if ($validated['amount'] < $pack->min_amount) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => "Le montant minimum pour ce pack est de " . number_format($pack->min_amount, 0, ',', ' ') . " FCFA.",
                ], 422);
            }

            $totalWeeks = (int) ceil($pack->duration_days / 7);
            $expectedReturn = round($validated['amount'] * (1 + $pack->roi_percentage / 100), 2);
            $weeklyPayout = round($expectedReturn / $totalWeeks, 2);

            if ($validated['payment_provider'] === 'wallet') {
                $wallet = $user->wallet;

                if (!$wallet || $wallet->fiat_balance < $validated['amount']) {
                    return response()->json([
                        'success' => false,
                        'data' => null,
                        'message' => 'Solde insuffisant dans le portefeuille.',
                    ], 400);
                }

                return DB::transaction(function () use ($user, $validated, $pack, $wallet) {
                    $wallet->decrement('fiat_balance', $validated['amount']);

                    $totalWeeks = (int) ceil($pack->duration_days / 7);
                    $expectedReturn = round($validated['amount'] * (1 + $pack->roi_percentage / 100), 2);
                    $weeklyPayout = round($expectedReturn / $totalWeeks, 2);

                    $investment = Investment::create([
                        'user_id' => $user->id,
                        'pack_id' => $pack->id,
                        'amount_invested' => $validated['amount'],
                        'expected_return' => $expectedReturn,
                        'weekly_payout' => $weeklyPayout,
                        'total_paid' => 0,
                        'remaining_payouts' => $totalWeeks,
                        'start_date' => Carbon::today(),
                        'end_date' => Carbon::today()->addDays($pack->duration_days),
                        'status' => 'active',
                    ]);

                    ProcessReferralBonus::dispatch($investment);

                    $this->logActivity(
                        'investment',
                        $user->first_name . ' ' . $user->last_name . ' a investi ' . number_format($validated['amount'], 0, ',', ' ') . ' FCFA dans le pack ' . $pack->name,
                        $user->id,
                        ['amount' => $validated['amount'], 'pack' => $pack->name, 'payment_method' => 'wallet']
                    );

                    return response()->json([
                        'success' => true,
                        'data' => new InvestmentResource($investment->load('pack')),
                        'message' => 'Investissement créé avec succès!',
                    ], 201);
                });
            }

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'type' => 'deposit',
                'amount' => $validated['amount'],
                'currency' => 'XAF',
                'status' => 'pending',
                'payment_provider' => $validated['payment_provider'],
                'description' => "Investissement - Pack {$pack->name}",
                'metadata' => ['pack_id' => $pack->id],
            ]);

            if ($validated['payment_provider'] === 'stripe') {
                $amountUsd = app(\App\Services\CurrencyService::class)->xafToUsd($validated['amount']);
                $payment = $this->paymentGateway->createPaymentIntent(
                    $amountUsd,
                    'usd',
                    ['transaction_id' => $transaction->id, 'user_id' => $user->id]
                );

                if (!$payment['success']) {
                    $transaction->update(['status' => 'failed']);
                    return response()->json([
                        'success' => false,
                        'data' => null,
                        'message' => $payment['message'] ?? 'Erreur de paiement.',
                    ], 500);
                }

                $transaction->update([
                    'provider_reference' => $payment['intent_id'],
                    'metadata' => ['client_secret' => $payment['client_secret']],
                ]);

                $this->logActivity(
                    'deposit',
                    $user->first_name . ' ' . $user->last_name . ' a initié un dépôt de ' . number_format($validated['amount'], 0, ',', ' ') . ' FCFA via Stripe',
                    $user->id,
                    ['amount' => $validated['amount'], 'method' => 'stripe', 'transaction_id' => $transaction->id]
                );

                return response()->json([
                    'success' => true,
                    'data' => [
                        'transaction' => $transaction,
                        'client_secret' => $payment['client_secret'],
                        'requires_confirmation' => true,
                    ],
                    'message' => 'Paiement initié. Veuillez confirmer le paiement.',
                ]);
            }

            if ($validated['payment_provider'] === 'flutterwave') {
                $payment = $this->paymentGateway->initiateFlutterwavePayment(
                    $validated['amount'],
                    'XAF',
                    [
                        'email' => $user->email,
                        'name' => $user->first_name . ' ' . $user->last_name,
                    ],
                    ['transaction_id' => $transaction->id]
                );

                if (!$payment['success']) {
                    $transaction->update(['status' => 'failed']);
                    return response()->json([
                        'success' => false,
                        'data' => null,
                        'message' => $payment['message'] ?? 'Erreur de paiement.',
                    ], 500);
                }

                $transaction->update([
                    'provider_reference' => $payment['reference'],
                ]);

                $this->logActivity(
                    'deposit',
                    $user->first_name . ' ' . $user->last_name . ' a initié un dépôt de ' . number_format($validated['amount'], 0, ',', ' ') . ' FCFA via Flutterwave',
                    $user->id,
                    ['amount' => $validated['amount'], 'method' => 'flutterwave', 'transaction_id' => $transaction->id]
                );

                return response()->json([
                    'success' => true,
                    'data' => [
                        'transaction' => $transaction,
                        'payment_link' => $payment['payment_link'],
                        'requires_confirmation' => true,
                    ],
                    'message' => 'Redirection vers le paiement Flutterwave.',
                ]);
            }

            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Mode de paiement non supporté.',
            ], 400);

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
                'message' => 'Erreur lors de la création de l\'investissement.',
            ], 500);
        }
    }

    public function callback(Request $request): JsonResponse
    {
        try {
            if (!$this->hasPaymentKeysConfigured()) {
                Log::warning('Webhook callback rejected — no payment keys configured', [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Service de paiement non configuré.',
                ], 503);
            }

            if (!$this->verifyWebhookSignature($request)) {
                Log::warning('Investment callback rejected — invalid webhook signature', [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Signature de webhook invalide.',
                ], 401);
            }

            $validated = $request->validate([
                'transaction_id' => 'required|integer|exists:transactions,id',
                'provider_reference' => 'required|string',
                'status' => 'required|in:successful,failed,cancelled',
            ]);

            DB::beginTransaction();

            $transaction = Transaction::lockForUpdate()->findOrFail($validated['transaction_id']);

            if ($transaction->status !== 'pending') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Cette transaction a déjà été traitée.',
                ], 400);
            }

            $transaction->update([
                'provider_reference' => $validated['provider_reference'],
                'status' => $validated['status'] === 'successful' ? 'success' : 'failed',
            ]);

            if ($validated['status'] !== 'successful') {
                DB::commit();
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Paiement échoué ou annulé.',
                ], 400);
            }

            $packId = $transaction->metadata['pack_id'] ?? null;
            if (!$packId) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Informations de pack manquantes.',
                ], 400);
            }

            $pack = InvestmentPack::findOrFail($packId);

            $investment = $this->createInvestmentFromTransaction($transaction, $pack);

            DB::commit();

            $this->logActivity(
                'investment',
                ($transaction->user->first_name ?? 'Utilisateur') . ' ' . ($transaction->user->last_name ?? '') . ' a confirmé un investissement de ' . number_format($transaction->amount, 0, ',', ' ') . ' FCFA dans le pack ' . $pack->name,
                $transaction->user_id,
                ['amount' => $transaction->amount, 'pack' => $pack->name, 'payment_method' => $transaction->payment_provider],
                false
            );

            return response()->json([
                'success' => true,
                'data' => new InvestmentResource($investment->load('pack')),
                'message' => 'Investissement confirmé avec succès! Bienvenue dans le pack ' . $pack->name . '.',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors du callback de paiement.',
            ], 500);
        }
    }

    public function activeInvestments(Request $request): JsonResponse
    {
        try {
            $investments = Investment::with('pack')
                ->where('user_id', $request->user()->id)
                ->where('status', 'active')
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => InvestmentResource::collection($investments),
                'message' => 'Investissements actifs récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des investissements actifs.',
            ], 500);
        }
    }

    private function verifyWebhookSignature(Request $request): bool
    {
        $stripeSignature = $request->header('Stripe-Signature');
        $flutterwaveHash = $request->header('verif-hash');

        if ($stripeSignature) {
            $webhookSecret = config('services.stripe.webhook_secret');
            if (!$webhookSecret) {
                return false;
            }
            try {
                $payload = $request->getContent();
                \Stripe\Webhook::constructEvent($payload, $stripeSignature, $webhookSecret);
                return true;
            } catch (\Exception $e) {
                Log::warning('Stripe webhook signature verification failed: ' . $e->getMessage());
                return false;
            }
        }

        if ($flutterwaveHash) {
            $expectedHash = config('services.flutterwave.webhook_hash');
            if (!$expectedHash) {
                return false;
            }
            return hash_equals($expectedHash, $flutterwaveHash);
        }

        return false;
    }

    private function hasPaymentKeysConfigured(): bool
    {
        return config('services.stripe.webhook_secret')
            || config('services.flutterwave.webhook_hash');
    }

    private function createInvestmentFromTransaction(Transaction $transaction, InvestmentPack $pack): Investment
    {
        $totalWeeks = (int) ceil($pack->duration_days / 7);
        $expectedReturn = round($transaction->amount * (1 + $pack->roi_percentage / 100), 2);
        $weeklyPayout = round($expectedReturn / $totalWeeks, 2);

        $investment = Investment::create([
            'user_id' => $transaction->user_id,
            'pack_id' => $pack->id,
            'transaction_id' => $transaction->id,
            'amount_invested' => $transaction->amount,
            'expected_return' => $expectedReturn,
            'weekly_payout' => $weeklyPayout,
            'total_paid' => 0,
            'remaining_payouts' => $totalWeeks,
            'start_date' => Carbon::today(),
            'end_date' => Carbon::today()->addDays($pack->duration_days),
            'status' => 'active',
        ]);

        ProcessReferralBonus::dispatch($investment);

        return $investment;
    }
}
