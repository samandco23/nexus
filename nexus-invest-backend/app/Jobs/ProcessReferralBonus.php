<?php

namespace App\Jobs;

use App\Models\Investment;
use App\Services\ReferralService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessReferralBonus implements ShouldQueue
{
    use Dispatchable, Queueable;

    public Investment $investment;

    public function __construct(Investment $investment)
    {
        $this->investment = $investment;
    }

    public function handle(ReferralService $referralService): void
    {
        try {
            $referralService->distributeBonuses($this->investment);
            Log::info("Referral bonuses processed for investment {$this->investment->id}");
        } catch (\Exception $e) {
            Log::error("Failed to process referral bonus for investment {$this->investment->id}: " . $e->getMessage());
        }
    }
}
