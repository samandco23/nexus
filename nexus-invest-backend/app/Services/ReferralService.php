<?php

namespace App\Services;

use App\Models\Investment;
use App\Models\ReferralEarning;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    private array $levelPercentages = [
        1 => 10.00,
        2 => 5.00,
        3 => 2.00,
    ];

    private int $retentionDays = 7;

    public function distributeBonuses(Investment $investment): void
    {
        $investor = $investment->user;
        if (!$investor->referred_by_id) {
            return;
        }

        DB::transaction(function () use ($investment, $investor) {
            $this->distributeForLevel($investment, $investor, 1);
        });
    }

    private function distributeForLevel(Investment $investment, User $investor, int $level): void
    {
        $referrer = $investor->referredBy;
        if (!$referrer || $level > 3) {
            return;
        }

        $percentage = $this->levelPercentages[$level] ?? 0;
        if ($percentage <= 0) {
            return;
        }

        $amount = round($investment->amount_invested * ($percentage / 100), 2);

        $transaction = Transaction::create([
            'user_id' => $referrer->id,
            'type' => 'referral_bonus',
            'amount' => $amount,
            'currency' => 'XAF',
            'status' => 'success',
            'payment_provider' => 'internal',
            'description' => "Bonus de parrainage niveau {$level} - {$investment->pack->name}",
        ]);

        ReferralEarning::create([
            'referrer_id' => $referrer->id,
            'referred_user_id' => $investor->id,
            'investment_id' => $investment->id,
            'level' => $level,
            'percentage' => $percentage,
            'amount' => $amount,
            'transaction_id' => $transaction->id,
        ]);

        $wallet = $referrer->wallet()->lockForUpdate()->first();
        if ($wallet) {
            $wallet->increment('fiat_balance', $amount);
            $wallet->increment('withdrawable_balance', $amount);
            $wallet->increment('lifetime_earnings', $amount);
        }

        $nextReferrer = $referrer->referredBy;
        if ($nextReferrer) {
            $nextInvestor = $referrer;
            $this->distributeForLevel($investment, $referrer, $level + 1);
        }
    }

    public function getReferralStats(User $user): array
    {
        $earnings = ReferralEarning::where('referrer_id', $user->id)
            ->selectRaw('level, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('level')
            ->get()
            ->keyBy('level');

        $totalEarned = ReferralEarning::where('referrer_id', $user->id)->sum('amount');

        $referralCounts = [];
        foreach ([1, 2, 3] as $level) {
            $referralCounts["level_{$level}"] = (int) ($earnings->get($level)?->count ?? 0);
        }

        $levelEarnings = [];
        foreach ([1, 2, 3] as $level) {
            $levelEarnings["level_{$level}"] = (float) ($earnings->get($level)?->total ?? 0);
        }

        return [
            'total_referrals' => array_sum($referralCounts),
            'total_earned' => (float) $totalEarned,
            'by_level' => $levelEarnings,
            'counts' => $referralCounts,
        ];
    }

    public function getReferralTree(User $user, int $maxDepth = 3): array
    {
        return $this->buildTree($user, 1, $maxDepth);
    }

    private function buildTree(User $user, int $currentLevel, int $maxDepth): array
    {
        if ($currentLevel > $maxDepth) {
            return [];
        }

        $referredUsers = $user->referredUsers()->get();

        $childIds = $referredUsers->pluck('id')->toArray();
        $investedSums = [];
        if (!empty($childIds)) {
            $investedSums = Investment::whereIn('user_id', $childIds)
                ->where('status', 'active')
                ->selectRaw('user_id, sum(amount_invested) as total')
                ->groupBy('user_id')
                ->pluck('total', 'user_id')
                ->toArray();
        }

        $tree = [];

        foreach ($referredUsers as $referred) {
            $totalInvested = (float) ($investedSums[$referred->id] ?? 0);

            $node = [
                'id' => $referred->id,
                'name' => $referred->first_name . ' ' . $referred->last_name,
                'email' => $referred->email,
                'level' => $currentLevel,
                'total_invested' => (float) $totalInvested,
                'joined_at' => $referred->created_at,
            ];

            $children = $this->buildTree($referred, $currentLevel + 1, $maxDepth);
            if (!empty($children)) {
                $node['children'] = $children;
            }

            $tree[] = $node;
        }

        return $tree;
    }

    public function getReferredUsersList(User $user): array
    {
        $referredUsers = $user->referredUsers()->get();

        $userIds = $referredUsers->pluck('id')->toArray();
        $investedSums = [];
        if (!empty($userIds)) {
            $investedSums = Investment::whereIn('user_id', $userIds)
                ->where('status', 'active')
                ->selectRaw('user_id, sum(amount_invested) as total')
                ->groupBy('user_id')
                ->pluck('total', 'user_id')
                ->toArray();
        }

        return $referredUsers->map(function ($referred) use ($investedSums) {
            return [
                'id' => $referred->id,
                'first_name' => $referred->first_name,
                'last_name' => $referred->last_name,
                'email' => $referred->email,
                'total_invested' => (float) ($investedSums[$referred->id] ?? 0),
                'created_at' => $referred->created_at,
            ];
        })->toArray();
    }

    public function validateReferralCode(string $code): ?User
    {
        return User::where('referral_code', $code)->first();
    }
}
