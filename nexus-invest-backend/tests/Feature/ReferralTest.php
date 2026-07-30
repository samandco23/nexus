<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferralTest extends TestCase
{
    use RefreshDatabase;

    public function test_referrals_list_empty_when_no_referrals(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/referrals');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [],
            ]);
    }

    public function test_referrals_list_returns_referred_users(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        User::factory()->count(3)->create(['referred_by_id' => $user->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/referrals');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
        $response->assertJsonCount(3, 'data');
    }

    public function test_referrals_list_structure(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $referred = User::factory()->create(['referred_by_id' => $user->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/referrals');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'total_invested',
                    'created_at',
                ],
            ],
        ]);
    }

    public function test_referrals_tree_returns_200(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/referrals/tree');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_referrals_tree_arborescent_structure(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $child = User::factory()->create(['referred_by_id' => $user->id]);
        User::factory()->create(['referred_by_id' => $child->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/referrals/tree');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'email',
                    'level',
                    'total_invested',
                    'joined_at',
                ],
            ],
        ]);
    }

    public function test_update_code_success(): void
    {
        $user = User::factory()->create();
        $user->referral_code = null;
        $user->save();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/referrals/code', [
                'referral_code' => 'MYCODE42',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['referral_code' => 'MYCODE42'],
            ]);
    }

    public function test_update_code_already_taken(): void
    {
        $user = User::factory()->create();
        $user->referral_code = null;
        $user->save();
        User::factory()->create(['referral_code' => 'TAKEN99']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/referrals/code', [
                'referral_code' => 'TAKEN99',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_update_code_too_short(): void
    {
        $user = User::factory()->create();
        $user->referral_code = null;
        $user->save();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/referrals/code', [
                'referral_code' => 'ABC',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }
}
