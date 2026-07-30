<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvestmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'pack' => new InvestmentPackResource($this->whenLoaded('pack')),
            'transaction_id' => $this->transaction_id,
            'amount_invested' => (float) $this->amount_invested,
            'expected_return' => (float) $this->expected_return,
            'weekly_payout' => (float) $this->weekly_payout,
            'total_paid' => (float) $this->total_paid,
            'remaining_payouts' => $this->remaining_payouts,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
