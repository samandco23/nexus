<?php

namespace Tests\Feature;

use App\Models\InvestmentPack;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvestmentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\SystemSettingSeeder::class);

        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;

        $this->user->wallet()->update([
            'fiat_balance' => 1000000,
            'withdrawable_balance' => 1000000,
        ]);
    }

    public function test_list_investment_packs_returns_all_active_packs(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/investment-packs');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id', 'name', 'min_amount', 'duration_days',
                    'roi_percentage', 'is_active',
                ],
            ],
            'message',
        ]);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_create_investment_with_wallet_successfully(): void
    {
        $pack = InvestmentPack::first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/investments', [
                'pack_id' => $pack->id,
                'amount' => $pack->min_amount,
                'payment_provider' => 'wallet',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'data' => ['id', 'amount_invested', 'status', 'pack'],
            'message',
        ]);

        $expectedBalance = 1000000 - $pack->min_amount;
        $this->assertEquals($expectedBalance, $this->user->wallet->fresh()->fiat_balance);
    }

    public function test_create_investment_insufficient_wallet_balance(): void
    {
        $this->user->wallet()->update(['fiat_balance' => 100]);
        $pack = InvestmentPack::first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/investments', [
                'pack_id' => $pack->id,
                'amount' => $pack->min_amount,
                'payment_provider' => 'wallet',
            ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
    }

    public function test_create_investment_amount_below_pack_minimum(): void
    {
        $pack = InvestmentPack::first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/investments', [
                'pack_id' => $pack->id,
                'amount' => $pack->min_amount - 1,
                'payment_provider' => 'wallet',
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_create_investment_invalid_pack_id(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/investments', [
                'pack_id' => 9999,
                'amount' => 5000,
                'payment_provider' => 'wallet',
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_list_investments_returns_paginated_results(): void
    {
        $pack = InvestmentPack::first();
        $totalWeeks = (int) ceil($pack->duration_days / 7);
        $expectedReturn = $pack->min_amount * (1 + $pack->roi_percentage / 100);
        $this->user->investments()->create([
            'pack_id' => $pack->id,
            'amount_invested' => $pack->min_amount,
            'weekly_payout' => round($expectedReturn / $totalWeeks, 2),
            'total_paid' => 0,
            'remaining_payouts' => $totalWeeks,
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays($pack->duration_days),
            'expected_return' => $expectedReturn,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/investments');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'data',
            'message',
        ]);
        $this->assertNotEmpty($response->json('data'));
        $this->assertIsArray($response->json('data'));
    }

    public function test_list_investments_excludes_other_users(): void
    {
        $pack = InvestmentPack::first();
        $totalWeeks = (int) ceil($pack->duration_days / 7);
        $expectedReturn = $pack->min_amount * (1 + $pack->roi_percentage / 100);
        $otherUser = User::factory()->create();
        $otherUser->investments()->create([
            'pack_id' => $pack->id,
            'amount_invested' => $pack->min_amount,
            'weekly_payout' => round($expectedReturn / $totalWeeks, 2),
            'total_paid' => 0,
            'remaining_payouts' => $totalWeeks,
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays($pack->duration_days),
            'expected_return' => $expectedReturn,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/investments');

        $response->assertStatus(200);
        $this->assertEmpty($response->json('data'));
    }

    public function test_active_investments_returns_only_active(): void
    {
        $pack = InvestmentPack::first();
        $totalWeeks = (int) ceil($pack->duration_days / 7);
        $expectedReturn = $pack->min_amount * (1 + $pack->roi_percentage / 100);
        $weeklyPayout = round($expectedReturn / $totalWeeks, 2);

        $this->user->investments()->create([
            'pack_id' => $pack->id,
            'amount_invested' => $pack->min_amount,
            'weekly_payout' => $weeklyPayout,
            'total_paid' => 0,
            'remaining_payouts' => $totalWeeks,
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays($pack->duration_days),
            'expected_return' => $expectedReturn,
        ]);

        $this->user->investments()->create([
            'pack_id' => $pack->id,
            'amount_invested' => $pack->min_amount,
            'weekly_payout' => $weeklyPayout,
            'total_paid' => $expectedReturn,
            'remaining_payouts' => 0,
            'status' => 'completed',
            'start_date' => now()->subDays(60),
            'end_date' => now()->subDays(30),
            'completed_at' => now()->subDays(30),
            'expected_return' => $expectedReturn,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/investments/active');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $investments = $response->json('data') ?? [];
        foreach ($investments as $inv) {
            $this->assertEquals('active', $inv['status']);
        }
    }
}
