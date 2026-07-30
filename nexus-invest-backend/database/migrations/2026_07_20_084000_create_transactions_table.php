<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', [
                'deposit', 'withdrawal', 'referral_bonus', 'loyalty_bonus',
                'weekly_profit', 'capital_release', 'token_conversion', 'mining_reward',
            ]);
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('XAF');
            $table->enum('status', ['pending', 'processing', 'success', 'failed', 'reversed'])->default('pending');
            $table->enum('payment_provider', ['stripe', 'flutterwave', 'internal'])->default('internal');
            $table->string('provider_reference')->nullable();
            $table->string('internal_reference', 50)->unique();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('available_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
