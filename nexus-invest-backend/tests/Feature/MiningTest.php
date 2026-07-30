<?php

namespace Tests\Feature;

use App\Models\InvestmentPack;
use App\Models\MiningLog;
use App\Models\SystemSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MiningTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        SystemSetting::setValue('token_value_xaf', '10');
        SystemSetting::setValue('mining_base_rate', '10');

        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;

        $pack = InvestmentPack::first();
        $this->user->wallet()->update([
            'fiat_balance' => 1000000,
            'withdrawable_balance' => 1000000,
        ]);

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
    }

    public function test_mining_status_returns_structure(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/mining/status');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'data' => ['can_start', 'can_claim', 'token_balance', 'rate_per_hour'],
            'message',
        ]);
    }

    public function test_start_mining_successfully(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/mining/start');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('mining_logs', [
            'user_id' => $this->user->id,
            'validated_at' => null,
        ]);
    }

    public function test_claim_mining_successfully(): void
    {
        MiningLog::create([
            'user_id' => $this->user->id,
            'tokens_mined' => 0,
            'base_rate' => 10,
            'referral_bonus_rate' => 0,
            'total_rate' => 10,
            'mined_date' => Carbon::today(),
            'validated_at' => null,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/mining/claim');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseMissing('mining_logs', [
            'user_id' => $this->user->id,
            'validated_at' => null,
        ]);
    }

    public function test_cannot_start_twice_in_same_day(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/mining/start');

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/mining/start');

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
    }

    public function test_mining_history_returns_results(): void
    {
        MiningLog::create([
            'user_id' => $this->user->id,
            'tokens_mined' => 10,
            'base_rate' => 10,
            'referral_bonus_rate' => 0,
            'total_rate' => 10,
            'mined_date' => Carbon::today(),
            'validated_at' => Carbon::now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/mining/history');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_convert_tokens_successfully(): void
    {
        $this->user->wallet()->update(['token_balance' => 100]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/mining/convert', [
                'token_amount' => 10,
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $wallet = $this->user->wallet->fresh();
        $this->assertEquals(90, $wallet->token_balance);
        $this->assertGreaterThan(1000000, $wallet->fiat_balance);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'type' => 'token_conversion',
        ]);
    }

    public function test_convert_tokens_insufficient_balance(): void
    {
        $this->user->wallet()->update(['token_balance' => 5]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/mining/convert', [
                'token_amount' => 10,
            ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
    }
}
