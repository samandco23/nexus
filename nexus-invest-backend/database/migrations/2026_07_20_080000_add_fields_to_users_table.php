<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('country', 100)->nullable()->after('phone');
            $table->string('country_code', 5)->nullable()->after('country');
            $table->string('referral_code', 20)->unique()->nullable()->after('country_code');
            $table->foreignId('referred_by_id')->nullable()->after('referral_code')->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('active')->after('referred_by_id');
            $table->unsignedTinyInteger('kyc_level')->default(0)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by_id']);
            $table->dropColumn([
                'first_name', 'last_name', 'phone', 'country', 'country_code',
                'referral_code', 'referred_by_id', 'status', 'kyc_level',
            ]);
            $table->string('name')->after('id');
        });
    }
};
