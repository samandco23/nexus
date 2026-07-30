<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_get_wallet(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/wallet');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'user_id',
                    'fiat_balance',
                    'withdrawable_balance',
                    'token_balance',
                    'lifetime_earnings',
                ],
                'message',
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user_id' => $user->id,
                ],
                'message' => 'Détails du portefeuille récupérés.',
            ]);
    }

    public function test_new_user_has_zero_balances(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/wallet');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'fiat_balance' => 0,
                    'withdrawable_balance' => 0,
                    'token_balance' => 0,
                    'lifetime_earnings' => 0,
                ],
            ]);
    }

    // ─── transactions ─────────────────────────────────────────────────────────

    public function test_authenticated_user_can_get_transactions(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/wallet/transactions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message',
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Transactions récupérées avec succès.',
            ]);
    }

    public function test_transactions_pagination_works(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/wallet/transactions?page=1');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'message',
            ]);
    }

    public function test_new_user_has_empty_transactions(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/wallet/transactions');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Transactions récupérées avec succès.',
            ]);

        $this->assertCount(0, $response->json('data'));
    }
}
