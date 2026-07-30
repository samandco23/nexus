<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MiningLog extends Model
{
    protected $fillable = [
        'user_id',
        'tokens_mined',
        'base_rate',
        'referral_bonus_rate',
        'total_rate',
        'mined_date',
        'validated_at',
    ];

    protected function casts(): array
    {
        return [
            'tokens_mined' => 'decimal:4',
            'base_rate' => 'decimal:4',
            'referral_bonus_rate' => 'decimal:4',
            'total_rate' => 'decimal:4',
            'mined_date' => 'date',
            'validated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
