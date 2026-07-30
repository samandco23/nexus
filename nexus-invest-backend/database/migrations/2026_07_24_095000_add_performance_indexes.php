<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('investments', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_investments_user_created');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'idx_transactions_user_created');
        });

        Schema::table('mining_logs', function (Blueprint $table) {
            $table->index(['user_id', 'mined_date'], 'idx_mining_logs_user_date');
        });

        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->index(['user_id', 'status', 'created_at'], 'idx_withdrawals_user_status_created');
        });
    }

    public function down(): void
    {
        Schema::table('investments', function (Blueprint $table) {
            $table->dropIndex('idx_investments_user_created');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_transactions_user_created');
        });

        Schema::table('mining_logs', function (Blueprint $table) {
            $table->dropIndex('idx_mining_logs_user_date');
        });

        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->dropIndex('idx_withdrawals_user_status_created');
        });
    }
};
