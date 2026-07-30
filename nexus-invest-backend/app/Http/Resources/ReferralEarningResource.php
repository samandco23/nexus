<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralEarningResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'referrer_id' => $this->referrer_id,
            'referred_user_id' => $this->referred_user_id,
            'investment_id' => $this->investment_id,
            'level' => $this->level,
            'percentage' => (float) $this->percentage,
            'amount' => (float) $this->amount,
            'transaction_id' => $this->transaction_id,
            'created_at' => $this->created_at,
        ];
    }
}
