<?php

namespace App\Jobs;

use App\Models\Investment;
use App\Models\Transaction;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayWeeklyGains implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        try {
            $today = Carbon::today();
            $activeInvestments = Investment::with(['user', 'pack'])
                ->where('status', 'active')
                ->whereDate('end_date', '>=', $today)
                ->get();

            $walletIds = $activeInvestments->pluck('user.wallet.id')->filter()->unique()->values()->toArray();
            $wallets = Wallet::whereIn('id', $walletIds)->get()->keyBy('user_id');

            $processed = 0;
            $totalPaid = 0;

            foreach ($activeInvestments as $investment) {
                try {
                    DB::transaction(function () use ($investment, $wallets, &$processed, &$totalPaid) {
                        $investment->lockForUpdate();

                        $payout = $investment->weekly_payout;
                        $newTotalPaid = $investment->total_paid + $payout;
                        $newRemainingPayouts = $investment->remaining_payouts - 1;

                        Transaction::create([
                            'user_id' => $investment->user_id,
                            'type' => 'weekly_profit',
                            'amount' => $payout,
                            'currency' => 'XAF',
                            'status' => 'success',
                            'payment_provider' => 'internal',
                            'description' => "Paiement hebdomadaire - {$investment->pack->name}",
                        ]);

                        $wallet = $wallets->get($investment->user_id);
                        if ($wallet) {
                            DB::table('wallets')
                                ->where('id', $wallet->id)
                                ->update([
                                    'fiat_balance' => DB::raw("fiat_balance + {$payout}"),
                                    'withdrawable_balance' => DB::raw("withdrawable_balance + {$payout}"),
                                    'lifetime_earnings' => DB::raw("lifetime_earnings + {$payout}"),
                                ]);
                        }

                        $updateData = [
                            'total_paid' => $newTotalPaid,
                            'remaining_payouts' => $newRemainingPayouts,
                        ];

                        if ($newRemainingPayouts <= 0) {
                            $updateData['status'] = 'completed';
                            $updateData['completed_at'] = Carbon::now();
                        }

                        $investment->update($updateData);

                        $processed++;
                        $totalPaid += $payout;
                    });
                } catch (\Exception $e) {
                    Log::error("Failed to process weekly gain for investment {$investment->id}: " . $e->getMessage());
                }
            }

            Log::info("Weekly gains paid: {$processed} investments processed, total {$totalPaid} XAF");

        } catch (\Exception $e) {
            Log::error('PayWeeklyGains job failed: ' . $e->getMessage());
        }
    }
}
