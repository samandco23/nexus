<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pack_id')->constrained('investment_packs');
            $table->foreignId('transaction_id')->nullable()->index();
            $table->decimal('amount_invested', 15, 2);
            $table->decimal('expected_return', 15, 2);
            $table->decimal('weekly_payout', 15, 2);
            $table->decimal('total_paid', 15, 2)->default(0);
            $table->integer('remaining_payouts');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['active', 'completed', 'early_withdrawn'])->default('active');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('end_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investments');
    }
};
