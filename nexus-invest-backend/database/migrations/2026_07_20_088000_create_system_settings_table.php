<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        DB::table('system_settings')->insert([
            [
                'key' => 'token_initial_value_usd',
                'value' => '0.10',
                'description' => 'Valeur initiale d\'un token en USD',
            ],
            [
                'key' => 'token_weekly_appreciation',
                'value' => '2.00',
                'description' => 'Appréciation hebdomadaire des tokens en %',
            ],
            [
                'key' => 'mining_base_rate',
                'value' => '10',
                'description' => 'Taux de minage de base par jour en tokens',
            ],
            [
                'key' => 'withdrawal_min_amount',
                'value' => '5000',
                'description' => 'Montant minimum de retrait en FCFA',
            ],
            [
                'key' => 'payout_day',
                'value' => 'Friday',
                'description' => 'Jour de la semaine pour les paiements hebdomadaires',
            ],
            [
                'key' => 'payout_time_utc',
                'value' => '12:00:00',
                'description' => 'Heure UTC pour les paiements hebdomadaires',
            ],
            [
                'key' => 'usd_to_xaf_rate',
                'value' => '600',
                'description' => 'Taux de conversion USD vers FCFA',
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
