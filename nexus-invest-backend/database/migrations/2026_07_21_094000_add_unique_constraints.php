<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mining_logs', function (Blueprint $table) {
            $table->unique(['user_id', 'mined_date'], 'mining_logs_user_date_unique');
        });

        Schema::table('otp_codes', function (Blueprint $table) {
            $table->unique(['user_id', 'code', 'type'], 'otp_codes_unique');
        });
    }

    public function down(): void
    {
        Schema::table('mining_logs', function (Blueprint $table) {
            $table->dropUnique('mining_logs_user_date_unique');
        });

        Schema::table('otp_codes', function (Blueprint $table) {
            $table->dropUnique('otp_codes_unique');
        });
    }
};
