<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'currency',
        'status',
        'payment_provider',
        'provider_reference',
        'internal_reference',
        'description',
        'metadata',
        'available_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'metadata' => 'array',
            'available_at' => 'datetime',
            'type' => 'string',
            'status' => 'string',
            'payment_provider' => 'string',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Transaction $transaction) {
            if (empty($transaction->internal_reference)) {
                $transaction->internal_reference = static::generateInternalReference();
            }
        });
    }

    private static function generateInternalReference(): string
    {
        $prefix = 'NEX-TRX-';
        do {
            $reference = $prefix . strtoupper(Str::random(20));
        } while (static::where('internal_reference', $reference)->exists());

        return $reference;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
