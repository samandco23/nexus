<?php

namespace Tests\Feature;

use App\Models\OtpCode;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ─── register ───────────────────────────────────────────────────────────────

    public function test_user_can_register_with_valid_data(): void
    {
        $data = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '+237612345678',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'country' => 'Cameroon',
            'country_code' => '+237',
            'captcha_token' => 'test-token',
        ];

        $response = $this->postJson('/api/v1/auth/register', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'first_name', 'last_name', 'email', 'wallet'],
                    'token',
                ],
                'message',
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'first_name' => 'John',
                        'last_name' => 'Doe',
                        'email' => 'john@example.com',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }

    public function test_user_cannot_register_with_existing_email(): void
    {
        User::factory()->create(['email' => 'john@example.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '+237612345678',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'country' => 'Cameroon',
            'country_code' => '+237',
            'captcha_token' => 'test-token',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Erreur de validation.',
            ]);
    }

    public function test_user_cannot_register_with_short_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '+237612345678',
            'password' => 'short',
            'password_confirmation' => 'short',
            'country' => 'Cameroon',
            'country_code' => '+237',
            'captcha_token' => 'test-token',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Erreur de validation.',
            ]);
    }

    public function test_user_can_register_with_valid_referral_code(): void
    {
        $referrer = User::factory()->create();

        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'phone' => '+237612345679',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'country' => 'Cameroon',
            'country_code' => '+237',
            'referral_code' => $referrer->referral_code,
            'captcha_token' => 'test-token',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'jane@example.com',
            'referred_by_id' => $referrer->id,
        ]);
    }

    public function test_user_cannot_register_with_invalid_referral_code(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'phone' => '+237612345679',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'country' => 'Cameroon',
            'country_code' => '+237',
            'referral_code' => 'INVALIDCODE',
            'captcha_token' => 'test-token',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Erreur de validation.',
            ]);
    }

    // ─── login ─────────────────────────────────────────────────────────────────

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('Password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'Password123',
            'captcha_token' => 'test-token',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'first_name', 'last_name', 'email', 'wallet'],
                    'token',
                ],
                'message',
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Connexion réussie.',
            ]);
    }

    public function test_user_cannot_login_with_unverified_email(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'unverified@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'unverified@example.com',
            'password' => 'password',
            'captcha_token' => 'test-token',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);
        $this->assertStringContainsString('vérifier votre adresse email', $response->json('message'));
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
            'captcha_token' => 'test-token',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Identifiants incorrects.',
            ]);
    }

    public function test_user_cannot_login_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'Password123',
            'captcha_token' => 'test-token',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Identifiants incorrects.',
            ]);
    }

    // ─── verify-email ──────────────────────────────────────────────────────────

    public function test_user_can_verify_email_with_valid_otp(): void
    {
        $user = User::factory()->unverified()->create();
        $user->sendEmailVerificationNotification();
        $token = $user->createToken('auth-token')->plainTextToken;

        $otp = OtpCode::where('user_id', $user->id)
            ->where('type', 'email_verification')
            ->first();

        $this->assertNotNull($otp);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/verify-email', ['code' => $otp->code]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Email vérifié avec succès.',
            ]);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_user_cannot_verify_with_invalid_otp(): void
    {
        $user = User::factory()->unverified()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/verify-email', ['code' => '000000']);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Code invalide ou expiré.',
            ]);
    }

    public function test_user_cannot_verify_with_expired_otp(): void
    {
        $user = User::factory()->unverified()->create();
        $user->sendEmailVerificationNotification();
        $token = $user->createToken('auth-token')->plainTextToken;

        $otp = OtpCode::where('user_id', $user->id)
            ->where('type', 'email_verification')
            ->first();

        $this->assertNotNull($otp);
        $otp->update(['expires_at' => Carbon::now()->subMinute()]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/verify-email', ['code' => $otp->code]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Code invalide ou expiré.',
            ]);
    }

    public function test_user_cannot_verify_if_already_verified(): void
    {
        $user = User::factory()->create(); // already verified by default
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/verify-email', ['code' => '123456']);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Email déjà vérifié.',
            ]);
    }

    // ─── resend-otp ────────────────────────────────────────────────────────────

    public function test_user_can_resend_otp(): void
    {
        $user = User::factory()->unverified()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/resend-otp');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Un nouveau code vous a été envoyé par email.',
            ]);
    }

    public function test_user_cannot_resend_otp_too_soon(): void
    {
        $user = User::factory()->unverified()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/resend-otp');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/resend-otp');

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Veuillez attendre 1 minute avant de demander un nouveau code.',
            ]);
    }

    // ─── me ────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'wallet',
                ],
                'message',
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ],
            ]);
    }

    public function test_authenticated_user_gets_wallet_with_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'wallet' => [
                        'id',
                        'user_id',
                        'fiat_balance',
                        'withdrawable_balance',
                        'token_balance',
                        'lifetime_earnings',
                    ],
                ],
            ]);
    }

    // ─── updateMe ──────────────────────────────────────────────────────────────

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/auth/me', [
                'first_name' => 'Updated',
                'last_name' => 'Name',
                'phone' => '+33612345678',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'first_name' => 'Updated',
                    'last_name' => 'Name',
                    'phone' => '+33612345678',
                ],
                'message' => 'Profil mis à jour avec succès.',
            ]);
    }

    public function test_user_can_update_only_valid_fields(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/auth/me', [
                'first_name' => 'NewName',
                'email' => 'shouldnotchange@example.com',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'first_name' => 'NewName',
                    'email' => $user->email,
                ],
            ]);
    }

    // ─── updatePassword ─────────────────────────────────────────────────────────

    public function test_user_can_update_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('currentpassword'),
        ]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/auth/password', [
                'current_password' => 'currentpassword',
                'password' => 'newPassword123',
                'password_confirmation' => 'newPassword123',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Mot de passe mis à jour avec succès.',
            ]);
    }

    public function test_user_cannot_update_password_with_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('currentpassword'),
        ]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/auth/password', [
                'current_password' => 'wrongpassword',
                'password' => 'newPassword123',
                'password_confirmation' => 'newPassword123',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Erreur de validation.',
            ]);
    }

    public function test_old_tokens_are_deleted_after_password_change(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('currentpassword'),
        ]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/auth/password', [
                'current_password' => 'currentpassword',
                'password' => 'newPassword123',
                'password_confirmation' => 'newPassword123',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    // ─── logout ────────────────────────────────────────────────────────────────

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Déconnexion réussie.',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }

    public function test_new_login_after_logout_creates_fresh_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'captcha_token' => 'test-token',
        ]);

        $login->assertStatus(200);
        $newToken = $login->json('data.token');
        $this->assertNotNull($newToken);
        $this->assertNotEquals($token, $newToken);
    }

    // ─── forgot-password ──────────────────────────────────────────────────────

    public function test_forgot_password_with_existing_email(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Lien de réinitialisation envoyé par email.',
            ]);
    }

    public function test_forgot_password_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Lien de réinitialisation envoyé par email.',
            ]);
    }
}
