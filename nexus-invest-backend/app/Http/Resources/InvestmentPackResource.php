<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvestmentPackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'min_amount' => (float) $this->min_amount,
            'duration_days' => $this->duration_days,
            'roi_percentage' => (float) $this->roi_percentage,
            'loyalty_bonus_percentage' => (float) $this->loyalty_bonus_percentage,
            'color_code' => $this->color_code,
            'icon_name' => $this->icon_name,
            'display_order' => $this->display_order,
            'is_active' => $this->is_active,
        ];
    }
}
