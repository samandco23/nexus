<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Investment extends Model
{
    protected $fillable = [
        'user_id',
        'pack_id',
        'transaction_id',
        'amount_invested',
        'expected_return',
        'weekly_payout',
        'total_paid',
        'remaining_payouts',
        'start_date',
        'end_date',
        'status',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_invested' => 'decimal:2',
            'expected_return' => 'decimal:2',
            'weekly_payout' => 'decimal:2',
            'total_paid' => 'decimal:2',
            'remaining_payouts' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'completed_at' => 'datetime',
            'status' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pack(): BelongsTo
    {
        return $this->belongsTo(InvestmentPack::class, 'pack_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
