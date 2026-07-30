<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mining_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('tokens_mined', 15, 4);
            $table->decimal('base_rate', 10, 4)->default(10);
            $table->decimal('referral_bonus_rate', 10, 4)->default(0);
            $table->decimal('total_rate', 10, 4);
            $table->date('mined_date');
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'mined_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mining_logs');
    }
};
