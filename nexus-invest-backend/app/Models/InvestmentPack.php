<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvestmentPack extends Model
{
    protected $fillable = [
        'name',
        'min_amount',
        'duration_days',
        'roi_percentage',
        'loyalty_bonus_percentage',
        'color_code',
        'icon_name',
        'display_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_amount' => 'decimal:2',
            'duration_days' => 'integer',
            'roi_percentage' => 'decimal:2',
            'loyalty_bonus_percentage' => 'decimal:2',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class, 'pack_id');
    }
}
