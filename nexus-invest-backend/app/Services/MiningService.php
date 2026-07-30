<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\MiningLog;
use App\Models\SystemSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MiningService
{
    private float $baseRate;

    public function __construct()
    {
        $this->baseRate = (float) SystemSetting::getValue('mining_base_rate', 10);
    }

    public function status(User $user): array
    {
        $todayLog = MiningLog::where('user_id', $user->id)
            ->whereDate('mined_date', Carbon::today())
            ->first();

        $lastLog = MiningLog::where('user_id', $user->id)
            ->latest('mined_date')
            ->first();

        $nextAvailable = null;
        $expiresAt = null;
        $canStart = true;
        $canClaim = false;
        $reason = null;
        $todayTokens = 0;

        if ($todayLog) {
            $canStart = false;

            if ($todayLog->validated_at === null) {
                $created = Carbon::parse($todayLog->created_at);
                $expiresAt = $created->copy()->addHours(24);

                if (Carbon::now()->greaterThan($expiresAt)) {
                    $reason = 'Session de minage expirée. Lancez une nouvelle session.';
                    $canStart = true;
                } else {
                    $canClaim = true;
                    $elapsedHours = $created->diffInHours(Carbon::now());
                    $accumulatedRate = $this->getAccumulatedRate($user, $todayLog);
                    $todayTokens = round($accumulatedRate * min($elapsedHours, 24), 4);
                }
            } else {
                $nextAvailable = Carbon::parse($todayLog->validated_at)->addHours(24);
                if (Carbon::now()->lessThan($nextAvailable)) {
                    $reason = 'Prochain minage disponible dans ' . $this->formatCountdown($nextAvailable);
                } else {
                    $canStart = true;
                }
            }
        }

        return [
            'can_start' => $canStart,
            'can_claim' => $canClaim,
            'reason' => $reason,
            'next_available' => $nextAvailable?->toIso8601String(),
            'expires_at' => $expiresAt?->toIso8601String(),
            'today_tokens' => $todayTokens,
            'session_active' => $todayLog && $todayLog->validated_at === null,
        ];
    }

    public function startMining(User $user): MiningLog
    {
        return DB::transaction(function () use ($user) {
            $today = Carbon::today();

            $existing = MiningLog::where('user_id', $user->id)
                ->where('mined_date', $today)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                if ($existing->validated_at === null) {
                    $created = Carbon::parse($existing->created_at);
                    if (Carbon::now()->lessThan($created->copy()->addHours(24))) {
                        throw new \RuntimeException('Session de minage déjà active.');
                    }
                    $existing->delete();
                } else {
                    $validatedAt = Carbon::parse($existing->validated_at);
                    if (Carbon::now()->lessThan($validatedAt->copy()->addHours(24))) {
                        throw new \RuntimeException('Vous devez attendre 24h entre chaque minage.');
                    }
                }
            }

            $rates = $this->getCurrentRate();
            $baseTokens = $rates['total_rate'];

            return MiningLog::create([
                'user_id' => $user->id,
                'tokens_mined' => 0,
                'base_rate' => $rates['base_rate'],
                'referral_bonus_rate' => $rates['referral_bonus_rate'],
                'total_rate' => $rates['total_rate'],
                'mined_date' => $today,
                'validated_at' => null,
            ]);
        });
    }

    public function claimMining(User $user): array
    {
        return DB::transaction(function () use ($user) {
            $log = MiningLog::where('user_id', $user->id)
                ->whereDate('mined_date', Carbon::today())
                ->whereNull('validated_at')
                ->lockForUpdate()
                ->first();

            if (!$log) {
                throw new \RuntimeException('Aucune session de minage active.');
            }

            $created = Carbon::parse($log->created_at);
            if (Carbon::now()->greaterThan($created->copy()->addHours(24))) {
                throw new \RuntimeException('Session de minage expirée. Lancez une nouvelle session.');
            }

            $elapsedHours = $created->diffInHours(Carbon::now());
            $accumulatedRate = $this->getAccumulatedRate($log->user_id, $log);
            $tokensMined = round($accumulatedRate * min($elapsedHours, 24), 4);

            $log->update([
                'tokens_mined' => $tokensMined,
                'validated_at' => Carbon::now(),
            ]);

            $wallet = $user->wallet()->lockForUpdate()->first();
            if ($wallet) {
                $wallet->increment('token_balance', $tokensMined);

                $tokenValueXaf = (float) SystemSetting::getValue('token_value_xaf', 10);
                $fiatEquivalent = round($tokensMined * $tokenValueXaf, 2);
                $wallet->increment('lifetime_earnings', $fiatEquivalent);
            }

            $user->transactions()->create([
                'type' => 'mining_reward',
                'amount' => $tokensMined,
                'currency' => 'NEX',
                'status' => 'success',
                'description' => number_format($tokensMined, 4) . ' NEX minés le ' . now()->format('d/m/Y'),
            ]);

            ActivityLog::create([
                'user_id' => $user->id,
                'type' => 'mining',
                'description' => $user->first_name . ' ' . $user->last_name . ' a miné ' . number_format($tokensMined, 4) . ' NEX',
                'ip_address' => request()->ip(),
                'metadata' => ['tokens' => $tokensMined, 'elapsed_hours' => $elapsedHours],
            ]);

            Log::channel('audit')->info('Mining claimed', [
                'user_id' => $user->id,
                'tokens' => $tokensMined,
                'elapsed_hours' => $elapsedHours,
            ]);

            return [
                'tokens_mined' => $tokensMined,
                'new_balance' => $wallet?->fresh()->token_balance ?? 0,
            ];
        });
    }

    public function history(User $user, int $days = 7): \Illuminate\Database\Eloquent\Collection
    {
        return MiningLog::where('user_id', $user->id)
            ->whereNotNull('validated_at')
            ->where('mined_date', '>=', Carbon::today()->subDays($days))
            ->orderBy('mined_date', 'desc')
            ->get();
    }

    public function convertTokens(User $user, float $tokenAmount): array
    {
        return DB::transaction(function () use ($user, $tokenAmount) {
            $wallet = $user->wallet()->lockForUpdate()->first();

            if (!$wallet || $wallet->token_balance < $tokenAmount) {
                return [
                    'success' => false,
                    'message' => 'Solde de tokens insuffisant. Vous avez ' . number_format($wallet->token_balance ?? 0, 2) . ' NEX.',
                ];
            }

            $tokenValueXaf = (float) SystemSetting::getValue('token_value_xaf', 10);
            $fiatAmount = round($tokenAmount * $tokenValueXaf, 2);

            if ($fiatAmount <= 0) {
                return [
                    'success' => false,
                    'message' => 'Le montant à convertir doit être supérieur à zéro.',
                ];
            }

            $wallet->decrement('token_balance', $tokenAmount);
            $wallet->increment('fiat_balance', $fiatAmount);

            $user->transactions()->create([
                'type' => 'token_conversion',
                'amount' => $fiatAmount,
                'currency' => 'FCFA',
                'status' => 'success',
                'description' => 'Conversion de ' . number_format($tokenAmount, 4) . ' NEX → ' . number_format($fiatAmount, 2) . ' FCFA',
            ]);

            Log::channel('audit')->info('Tokens converted to FCFA', [
                'user_id' => $user->id,
                'tokens' => $tokenAmount,
                'fiat' => $fiatAmount,
                'rate' => $tokenValueXaf,
            ]);

            return [
                'success' => true,
                'fiat_amount' => $fiatAmount,
                'tokens_used' => $tokenAmount,
                'new_token_balance' => $wallet->fresh()->token_balance,
                'new_fiat_balance' => $wallet->fresh()->fiat_balance,
            ];
        });
    }

    private function getCurrentRate(): array
    {
        $baseRate = $this->baseRate;
        return [
            'base_rate' => $baseRate,
            'referral_bonus_rate' => 0,
            'total_rate' => $baseRate,
        ];
    }

    private function getAccumulatedRate(User|int $user, MiningLog $log): float
    {
        return $log->total_rate;
    }

    private function formatCountdown(Carbon $target): string
    {
        $minutes = Carbon::now()->diffInMinutes($target);
        if ($minutes < 60) return $minutes . ' min';
        $hours = intdiv($minutes, 60);
        $mins = $minutes % 60;
        return $hours . 'h ' . $mins . ' min';
    }
}
