<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'fiat_balance' => (float) $this->fiat_balance,
            'withdrawable_balance' => (float) $this->withdrawable_balance,
            'token_balance' => (float) $this->token_balance,
            'lifetime_earnings' => (float) $this->lifetime_earnings,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
