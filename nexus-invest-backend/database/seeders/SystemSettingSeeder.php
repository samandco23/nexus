<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'token_initial_value_usd', 'value' => '0.10', 'description' => 'Valeur initiale du token NEX en USD'],
            ['key' => 'token_weekly_appreciation', 'value' => '2.00', 'description' => 'Appréciation hebdomadaire du token en %'],
            ['key' => 'mining_base_rate', 'value' => '10', 'description' => 'Taux de base de minage par jour'],
            ['key' => 'withdrawal_min_amount', 'value' => '1.00', 'description' => 'Montant minimum de retrait en USD'],
            ['key' => 'payout_day', 'value' => 'Friday', 'description' => 'Jour de la semaine pour les paiements'],
            ['key' => 'payout_time_utc', 'value' => '12:00', 'description' => 'Heure UTC pour les paiements hebdomadaires'],
            ['key' => 'usd_to_xaf_rate', 'value' => '650', 'description' => 'Taux de conversion USD vers FCFA'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
