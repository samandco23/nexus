<?php

namespace Tests\Feature;

use App\Models\Investment;
use App\Models\InvestmentPack;
use App\Models\User;
use App\Models\WithdrawalRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);
        $this->adminToken = $this->admin->createToken('admin-test')->plainTextToken;
    }

    public function test_admin_stats_returns_200(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_admin_stats_structure(): void
    {
        User::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/stats');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'total_users',
                'active_users',
                'total_invested',
                'active_investments',
                'pending_withdrawals',
                'total_withdrawn',
                'recent_users',
            ],
        ]);
        $this->assertEquals(4, $response->json('data.total_users')); // admin + 3
        $this->assertEquals(4, $response->json('data.active_users'));
    }

    public function test_non_admin_gets_403_on_stats(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/stats');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Accès non autorisé.',
            ]);
    }

    public function test_admin_users_list_returns_200(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_non_admin_gets_403_on_users_list(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_user_detail_returns_200(): void
    {
        $target = User::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/users/' . $target->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_admin_user_detail_not_found(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/users/9999');

        $response->assertStatus(404);
    }

    public function test_toggle_user_status_suspends_user(): void
    {
        $target = User::factory()->create(['status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson('/api/v1/admin/users/' . $target->id . '/toggle-status');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
        $this->assertEquals('suspended', $target->fresh()->status);
    }

    public function test_cannot_suspend_last_admin(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson('/api/v1/admin/users/' . $this->admin->id . '/toggle-status');

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Impossible de suspendre le dernier administrateur.',
            ]);
    }

    public function test_reactivates_suspended_user(): void
    {
        $target = User::factory()->create(['status' => 'suspended']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson('/api/v1/admin/users/' . $target->id . '/toggle-status');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
        $this->assertEquals('active', $target->fresh()->status);
    }

    public function test_admin_investments_list_returns_200(): void
    {
        $pack = InvestmentPack::create([
            'name' => 'Test Pack',
            'min_amount' => 1000,
            'duration_days' => 30,
            'roi_percentage' => 10,
            'color_code' => '#000000',
            'icon_name' => 'test',
            'display_order' => 1,
        ]);
        Investment::create([
            'user_id' => $this->admin->id,
            'pack_id' => $pack->id,
            'amount_invested' => 5000,
            'expected_return' => 5500,
            'weekly_payout' => 500,
            'total_paid' => 0,
            'remaining_payouts' => 4,
            'start_date' => now(),
            'end_date' => now()->addDays(30),
            'status' => 'active',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/investments');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_admin_investments_pagination(): void
    {
        $pack = InvestmentPack::create([
            'name' => 'Test Pack',
            'min_amount' => 1000,
            'duration_days' => 30,
            'roi_percentage' => 10,
            'color_code' => '#000000',
            'icon_name' => 'test',
            'display_order' => 1,
        ]);
        Investment::create([
            'user_id' => $this->admin->id,
            'pack_id' => $pack->id,
            'amount_invested' => 5000,
            'expected_return' => 5500,
            'weekly_payout' => 500,
            'total_paid' => 0,
            'remaining_payouts' => 4,
            'start_date' => now(),
            'end_date' => now()->addDays(30),
            'status' => 'active',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/investments');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'user_id',
                    'pack',
                    'amount_invested',
                    'status',
                ],
            ],
        ]);
    }

    public function test_admin_withdrawals_list_returns_200(): void
    {
        WithdrawalRequest::create([
            'user_id' => $this->admin->id,
            'amount' => 10000,
            'currency' => 'XAF',
            'method' => 'flutterwave_mobile_money',
            'recipient_details' => ['phone' => '+237600000000'],
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/withdrawals');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_approve_withdrawal_success(): void
    {
        $withdrawal = WithdrawalRequest::create([
            'user_id' => $this->admin->id,
            'amount' => 10000,
            'currency' => 'XAF',
            'method' => 'flutterwave_mobile_money',
            'recipient_details' => ['phone' => '+237600000000'],
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson('/api/v1/admin/withdrawals/' . $withdrawal->id . '/approve');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
        $this->assertEquals('processing', $withdrawal->fresh()->status);
    }

    public function test_approve_already_processed_withdrawal_returns_400(): void
    {
        $withdrawal = WithdrawalRequest::create([
            'user_id' => $this->admin->id,
            'amount' => 10000,
            'currency' => 'XAF',
            'method' => 'flutterwave_mobile_money',
            'recipient_details' => ['phone' => '+237600000000'],
            'status' => 'processing',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson('/api/v1/admin/withdrawals/' . $withdrawal->id . '/approve');

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Cette demande a déjà été traitée.',
            ]);
    }

    public function test_reject_withdrawal_success_and_refund(): void
    {
        $user = User::factory()->create();
        $wallet = $user->wallet;
        $wallet->withdrawable_balance = 50000;
        $wallet->save();

        $withdrawal = WithdrawalRequest::create([
            'user_id' => $user->id,
            'amount' => 10000,
            'currency' => 'XAF',
            'method' => 'flutterwave_mobile_money',
            'recipient_details' => ['phone' => '+237600000000'],
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson('/api/v1/admin/withdrawals/' . $withdrawal->id . '/reject');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
        $this->assertEquals('rejected', $withdrawal->fresh()->status);
        $this->assertEquals(60000, (float) $user->fresh()->wallet->withdrawable_balance);
    }

    public function test_reject_already_processed_withdrawal_returns_400(): void
    {
        $withdrawal = WithdrawalRequest::create([
            'user_id' => $this->admin->id,
            'amount' => 10000,
            'currency' => 'XAF',
            'method' => 'flutterwave_mobile_money',
            'recipient_details' => ['phone' => '+237600000000'],
            'status' => 'completed',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->putJson('/api/v1/admin/withdrawals/' . $withdrawal->id . '/reject');

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Cette demande a déjà été traitée.',
            ]);
    }

    public function test_non_admin_gets_403_on_all_admin_routes(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $withdrawal = WithdrawalRequest::create([
            'user_id' => $this->admin->id,
            'amount' => 10000,
            'currency' => 'XAF',
            'method' => 'flutterwave_mobile_money',
            'recipient_details' => ['phone' => '+237600000000'],
            'status' => 'pending',
        ]);

        $headers = ['Authorization' => 'Bearer ' . $token];

        $this->getJson('/api/v1/admin/stats', $headers)->assertStatus(403);
        $this->getJson('/api/v1/admin/users', $headers)->assertStatus(403);
        $this->getJson('/api/v1/admin/users/' . $this->admin->id, $headers)->assertStatus(403);
        $this->putJson('/api/v1/admin/users/' . $this->admin->id . '/toggle-status', [], $headers)->assertStatus(403);
        $this->getJson('/api/v1/admin/investments', $headers)->assertStatus(403);
        $this->getJson('/api/v1/admin/withdrawals', $headers)->assertStatus(403);
        $this->putJson('/api/v1/admin/withdrawals/' . $withdrawal->id . '/approve', [], $headers)->assertStatus(403);
        $this->putJson('/api/v1/admin/withdrawals/' . $withdrawal->id . '/reject', [], $headers)->assertStatus(403);
    }

    public function test_suspended_admin_gets_403_on_all_admin_routes(): void
    {
        $suspendedAdmin = User::factory()->create([
            'is_admin' => true,
            'status' => 'suspended',
            'email_verified_at' => now(),
        ]);
        $token = $suspendedAdmin->createToken('test')->plainTextToken;

        $headers = ['Authorization' => 'Bearer ' . $token];

        $this->getJson('/api/v1/admin/stats', $headers)->assertStatus(403);
        $this->getJson('/api/v1/admin/users', $headers)->assertStatus(403);
    }
}
