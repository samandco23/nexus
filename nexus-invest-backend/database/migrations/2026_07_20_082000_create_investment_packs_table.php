<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investment_packs', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->decimal('min_amount', 15, 2);
            $table->integer('duration_days');
            $table->decimal('roi_percentage', 5, 2);
            $table->decimal('loyalty_bonus_percentage', 5, 2)->default(10);
            $table->string('color_code', 7);
            $table->string('icon_name', 50);
            $table->tinyInteger('display_order');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('investment_packs')->insert([
            [
                'name' => 'Starter',
                'min_amount' => 3500,
                'duration_days' => 7,
                'roi_percentage' => 100.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#10b981',
                'icon_name' => 'Rocket',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Bronze',
                'min_amount' => 10000,
                'duration_days' => 15,
                'roi_percentage' => 120.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#d97706',
                'icon_name' => 'Zap',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Argent',
                'min_amount' => 25000,
                'duration_days' => 30,
                'roi_percentage' => 150.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#a3a3a3',
                'icon_name' => 'Star',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Or',
                'min_amount' => 50000,
                'duration_days' => 60,
                'roi_percentage' => 180.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#f59e0b',
                'icon_name' => 'Award',
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Platine',
                'min_amount' => 100000,
                'duration_days' => 90,
                'roi_percentage' => 220.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#818cf8',
                'icon_name' => 'Gem',
                'display_order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Diamant',
                'min_amount' => 250000,
                'duration_days' => 120,
                'roi_percentage' => 260.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#06b6d4',
                'icon_name' => 'Diamond',
                'display_order' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Elite',
                'min_amount' => 500000,
                'duration_days' => 180,
                'roi_percentage' => 320.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#ec4899',
                'icon_name' => 'Crown',
                'display_order' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'Ambassadeur',
                'min_amount' => 1000000,
                'duration_days' => 240,
                'roi_percentage' => 400.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#8b5cf6',
                'icon_name' => 'Fish',
                'display_order' => 8,
                'is_active' => true,
            ],
            [
                'name' => 'Titan',
                'min_amount' => 2000000,
                'duration_days' => 270,
                'roi_percentage' => 500.00,
                'loyalty_bonus_percentage' => 0,
                'color_code' => '#f43f5e',
                'icon_name' => 'Flame',
                'display_order' => 9,
                'is_active' => true,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('investment_packs');
    }
};
