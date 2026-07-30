<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wallet extends Model
{
    protected $fillable = [
        'user_id',
        'fiat_balance',
        'withdrawable_balance',
        'token_balance',
        'lifetime_earnings',
    ];

    protected function casts(): array
    {
        return [
            'fiat_balance' => 'decimal:2',
            'withdrawable_balance' => 'decimal:2',
            'token_balance' => 'decimal:2',
            'lifetime_earnings' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
