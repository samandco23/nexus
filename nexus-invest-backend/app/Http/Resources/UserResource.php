<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'country' => $this->country,
            'country_code' => $this->country_code,
            'referral_code' => $this->referral_code,
            'referred_by_id' => $this->referred_by_id,
            'status' => $this->status,
            'kyc_level' => $this->kyc_level,
            'email_verified_at' => $this->email_verified_at,
            'phone_verified_at' => $this->phone_verified_at,
            'is_admin' => (bool) $this->is_admin,
            'wallet' => new WalletResource($this->whenLoaded('wallet')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
