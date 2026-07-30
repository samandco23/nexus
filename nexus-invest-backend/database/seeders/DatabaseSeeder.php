<?php

namespace Database\Seeders;

use App\Models\ChatRoom;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            InvestmentPackSeeder::class,
        ]);

        User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'Nexus',
            'email' => 'admin@nexus-invest.com',
            'phone' => '+237600000001',
            'country' => 'Cameroun',
            'country_code' => '+237',
            'is_admin' => true,
        ]);

        ChatRoom::create([
            'type' => 'general',
            'name' => 'Général',
            'is_active' => true,
        ]);

        SystemSetting::setValue('token_value_xaf', '10', '1 NEX = X FCFA');
        SystemSetting::setValue('mining_base_rate', '10', 'Taux de base du minage par heure');
        SystemSetting::setValue('min_withdrawal', '5000', 'Montant minimum de retrait');
        SystemSetting::setValue('referral_bonus_percent', '5', 'Bonus de parrainage en %');
    }
}
