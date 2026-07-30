<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\OtpCode;
use App\Models\User;
use App\Models\Wallet;
use App\Rules\Recaptcha;
use App\Services\ReferralService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use LogsActivity;

    public function register(Request $request, ReferralService $referralService): JsonResponse
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'required|string|max:30',
                'password' => ['required', 'string', 'min:8', 'confirmed', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/'],
                'country' => 'required|string|max:100',
                'country_code' => 'required|string|max:5',
                'referral_code' => 'nullable|string|max:20|exists:users,referral_code',
                'captcha_token' => ['required', new Recaptcha],
            ]);

            $validated['password'] = Hash::make($validated['password']);
            $validated['status'] = 'active';
            $validated['kyc_level'] = 0;

            if (!empty($validated['referral_code'])) {
                $referrer = $referralService->validateReferralCode($validated['referral_code']);
                $validated['referred_by_id'] = $referrer?->id;
                unset($validated['referral_code']);
            }

            $user = User::create($validated);

            $token = $user->createToken('auth-token')->plainTextToken;

            $user->sendEmailVerificationNotification();

            $this->logActivity(
                'registration',
                $user->first_name . ' ' . $user->last_name . ' a rejoint la plateforme',
                $user->id,
                ['email' => $user->email]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserResource($user->load('wallet')),
                    'token' => $token,
                ],
                'message' => 'Inscription réussie. Un code de vérification vous a été envoyé par email.',
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Une erreur est survenue lors de l\'inscription.',
            ], 500);
        }
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|size:6',
            ]);

            $user = $request->user();

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'Email déjà vérifié.',
                ]);
            }

            $otp = OtpCode::where('user_id', $user->id)
                ->where('code', $validated['code'])
                ->where('type', 'email_verification')
                ->whereNull('used_at')
                ->latest()
                ->first();

            if (!$otp || !$otp->isValid()) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Code invalide ou expiré.',
                ], 400);
            }

            $otp->update(['used_at' => now()]);
            $user->markEmailAsVerified();

            return response()->json([
                'success' => true,
                'data' => new UserResource($user->load('wallet')),
                'message' => 'Email vérifié avec succès.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Une erreur est survenue.',
            ], 500);
        }
    }

    public function resendOtp(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'Email déjà vérifié.',
                ]);
            }

            $recent = OtpCode::where('user_id', $user->id)
                ->where('type', 'email_verification')
                ->whereNull('used_at')
                ->where('created_at', '>=', Carbon::now()->subMinute())
                ->first();

            if ($recent) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Veuillez attendre 1 minute avant de demander un nouveau code.',
                ], 429);
            }

            $user->sendEmailVerificationNotification();

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Un nouveau code vous a été envoyé par email.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Une erreur est survenue.',
            ], 500);
        }
    }

    public function verifyPhone(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|size:6',
            ]);

            $user = $request->user();

            if ($user->hasVerifiedPhone()) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'Téléphone déjà vérifié.',
                ]);
            }

            $otp = OtpCode::where('user_id', $user->id)
                ->where('code', $validated['code'])
                ->where('type', 'phone_verification')
                ->whereNull('used_at')
                ->latest()
                ->first();

            if (!$otp || !$otp->isValid()) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Code invalide ou expiré.',
                ], 400);
            }

            $otp->update(['used_at' => now()]);
            $user->markPhoneAsVerified();

            Log::channel('audit')->info('Téléphone vérifié', [
                'user_id' => $user->id,
                'phone' => $user->phone,
            ]);

            return response()->json([
                'success' => true,
                'data' => new UserResource($user->load('wallet')),
                'message' => 'Téléphone vérifié avec succès.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Une erreur est survenue.',
            ], 500);
        }
    }

    public function resendPhoneOtp(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->hasVerifiedPhone()) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'Téléphone déjà vérifié.',
                ]);
            }

            $recent = OtpCode::where('user_id', $user->id)
                ->where('type', 'phone_verification')
                ->whereNull('used_at')
                ->where('created_at', '>=', Carbon::now()->subMinute())
                ->first();

            if ($recent) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Veuillez attendre 1 minute avant de demander un nouveau code.',
                ], 429);
            }

            $user->generatePhoneOtp();

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Un nouveau code vous a été envoyé par SMS.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Une erreur est survenue.',
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
                'captcha_token' => ['required', new Recaptcha],
            ]);

            $user = User::where('email', $validated['email'])->first();

            $passwordCheck = $user
                ? Hash::check($validated['password'], $user->password)
                : (Hash::check($validated['password'], Hash::make('dummy')) && false);

            if (!$user || !$passwordCheck) {
                Log::channel('audit')->warning('Échec de connexion', [
                    'email' => $validated['email'],
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Identifiants incorrects.',
                ], 401);
            }

            if (!$user->hasVerifiedEmail()) {
                $user->sendEmailVerificationNotification();
                return response()->json([
                    'success' => false,
                    'data' => [
                        'user' => new UserResource($user->load('wallet')),
                    ],
                    'message' => 'Veuillez vérifier votre adresse email avant de vous connecter. Un nouveau code de vérification vous a été envoyé.',
                ], 403);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            $this->logActivity(
                'login',
                $user->first_name . ' ' . $user->last_name . ' s\'est connecté',
                $user->id
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserResource($user->load('wallet')),
                    'token' => $token,
                ],
                'message' => 'Connexion réussie.',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Une erreur est survenue lors de la connexion.',
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $userId = $user->id;
            $userName = $user->first_name . ' ' . $user->last_name;
            $user->currentAccessToken()->delete();

            $this->logActivity(
                'logout',
                $userName . ' s\'est déconnecté',
                $userId
            );

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Déconnexion réussie.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la déconnexion.',
            ], 500);
        }
    }

    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user()->load('wallet');

            return response()->json([
                'success' => true,
                'data' => new UserResource($user),
                'message' => 'Profil récupéré avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération du profil.',
            ], 500);
        }
    }

    public function updateMe(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:30',
                'country' => 'sometimes|string|max:100',
            ]);

            $user = $request->user();
            $user->update($validated);

            return response()->json([
                'success' => true,
                'data' => new UserResource($user->load('wallet')),
                'message' => 'Profil mis à jour avec succès.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la mise à jour du profil.',
            ], 500);
        }
    }

    public function updatePassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string|current_password',
                'password' => ['required', 'string', 'min:8', 'confirmed', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/'],
            ]);

            $user = $request->user();
            $user->password = Hash::make($validated['password']);
            $user->save();

            $user->tokens()->delete();

            Log::channel('audit')->info('Mot de passe modifié', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Mot de passe mis à jour avec succès.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la mise à jour du mot de passe.',
            ], 500);
        }
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
            ]);

            $status = Password::sendResetLink($validated);

            return response()->json([
                'success' => in_array($status, [Password::RESET_LINK_SENT, Password::INVALID_USER]),
                'data' => null,
                'message' => 'Lien de réinitialisation envoyé par email.',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Une erreur est survenue.',
            ], 500);
        }
    }

    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
                'email' => 'required|string|email',
                'password' => ['required', 'string', 'min:8', 'confirmed', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/'],
            ]);

            $status = Password::reset(
                $validated,
                function (User $user, string $password) {
                    $user->password = Hash::make($password);
                    $user->save();
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'Mot de passe réinitialisé avec succès.',
                ]);
            }

            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Token de réinitialisation invalide ou expiré.',
            ], 400);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'data' => $e->errors(),
                'message' => 'Erreur de validation.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Une erreur est survenue.',
            ], 500);
        }
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $user->tokens()->delete();

            DB::transaction(function () use ($user) {
                $user->wallet()->delete();
                $user->investments()->delete();
                $user->transactions()->delete();
                $user->miningLogs()->delete();
                $user->referralEarnings()->delete();
                $user->withdrawalRequests()->delete();
                $user->chatMessages()->delete();
                $user->otpCodes()->delete();
                $user->delete();
            });

            Log::channel('audit')->info('Account deleted', ['user_id' => $user->id, 'email' => $user->email]);

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Compte supprimé avec succès.',
            ]);
        } catch (\Exception $e) {
            Log::channel('audit')->error('Account deletion failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la suppression du compte.',
            ], 500);
        }
    }

    public function exportData(Request $request): JsonResponse
    {
        try {
            $user = $request->user()->load([
                'wallet',
                'investments.pack',
                'transactions',
                'miningLogs',
                'referralEarnings',
                'withdrawalRequests',
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'country' => $user->country,
                        'created_at' => $user->created_at,
                    ],
                    'wallet' => $user->wallet,
                    'investments' => $user->investments,
                    'transactions' => $user->transactions,
                    'mining_logs' => $user->miningLogs,
                    'referral_earnings' => $user->referralEarnings,
                    'withdrawal_requests' => $user->withdrawalRequests,
                ],
                'message' => 'Données exportées avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de l\'export des données.',
            ], 500);
        }
    }
}
