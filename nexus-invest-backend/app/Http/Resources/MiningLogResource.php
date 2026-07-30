<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MiningLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'tokens_mined' => (float) $this->tokens_mined,
            'base_rate' => (float) $this->base_rate,
            'referral_bonus_rate' => (float) $this->referral_bonus_rate,
            'total_rate' => (float) $this->total_rate,
            'mined_date' => $this->mined_date,
            'validated_at' => $this->validated_at?->toIso8601String(),
            'created_at' => $this->created_at,
        ];
    }
}
