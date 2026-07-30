<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WithdrawalRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WithdrawalTest extends TestCase
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

        $this->user->wallet()->update(['withdrawable_balance' => 100000]);
    }

    public function test_create_withdrawal_successfully(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/withdrawals', [
                'amount' => 5000,
                'method' => 'stripe',
                'recipient_details' => ['email' => 'test@example.com'],
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'data' => ['id', 'amount', 'status', 'method', 'created_at'],
            'message',
        ]);
        $this->assertEquals('pending', $response->json('data.status'));
        $this->assertEquals(95000, $this->user->wallet->fresh()->withdrawable_balance);
    }

    public function test_create_withdrawal_insufficient_balance(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/withdrawals', [
                'amount' => 100001,
                'method' => 'stripe',
                'recipient_details' => ['email' => 'test@example.com'],
            ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
    }

    public function test_create_withdrawal_amount_below_minimum(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/withdrawals', [
                'amount' => 0,
                'method' => 'stripe',
                'recipient_details' => ['email' => 'test@example.com'],
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_create_withdrawal_non_numeric_amount(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/withdrawals', [
                'amount' => 'abc',
                'method' => 'stripe',
                'recipient_details' => ['email' => 'test@example.com'],
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_list_withdrawals_returns_paginated_results(): void
    {
        WithdrawalRequest::create([
            'user_id' => $this->user->id,
            'amount' => 5000,
            'currency' => 'XAF',
            'method' => 'stripe',
            'recipient_details' => ['email' => 'test@example.com'],
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/withdrawals');

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

    public function test_list_withdrawals_excludes_other_users(): void
    {
        $otherUser = User::factory()->create();
        WithdrawalRequest::create([
            'user_id' => $otherUser->id,
            'amount' => 5000,
            'currency' => 'XAF',
            'method' => 'stripe',
            'recipient_details' => ['email' => 'other@example.com'],
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/withdrawals');

        $response->assertStatus(200);
        $this->assertEmpty($response->json('data'));
    }

    public function test_cancel_pending_withdrawal_successfully(): void
    {
        $withdrawal = WithdrawalRequest::create([
            'user_id' => $this->user->id,
            'amount' => 5000,
            'currency' => 'XAF',
            'method' => 'stripe',
            'recipient_details' => ['email' => 'test@example.com'],
            'status' => 'pending',
        ]);

        $this->user->wallet()->update(['withdrawable_balance' => 95000]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/withdrawals/{$withdrawal->id}/cancel");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertEquals('rejected', $withdrawal->fresh()->status);
        $this->assertEquals(100000, $this->user->wallet->fresh()->withdrawable_balance);
    }

    public function test_cancel_already_processed_withdrawal_fails(): void
    {
        $withdrawal = WithdrawalRequest::create([
            'user_id' => $this->user->id,
            'amount' => 5000,
            'currency' => 'XAF',
            'method' => 'stripe',
            'recipient_details' => ['email' => 'test@example.com'],
            'status' => 'approved',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/withdrawals/{$withdrawal->id}/cancel");

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
    }

    public function test_cancel_another_users_withdrawal_fails(): void
    {
        $otherUser = User::factory()->create();
        $otherUser->wallet()->update(['withdrawable_balance' => 100000]);

        $withdrawal = WithdrawalRequest::create([
            'user_id' => $otherUser->id,
            'amount' => 5000,
            'currency' => 'XAF',
            'method' => 'stripe',
            'recipient_details' => ['email' => 'other@example.com'],
            'status' => 'pending',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->putJson("/api/v1/withdrawals/{$withdrawal->id}/cancel");

        $response->assertStatus(404);
        $response->assertJsonPath('success', false);
    }
}
