<?php

namespace App\Models;

use App\Notifications\SendEmailOtp;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'country',
        'country_code',
        'referral_code',
        'referred_by_id',
        'status',
        'kyc_level',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'kyc_level' => 'integer',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (User $user) {
            if (empty($user->referral_code)) {
                $user->referral_code = static::generateUniqueReferralCode();
            }
        });

        static::created(function (User $user) {
            $user->wallet()->create([
                'fiat_balance' => 0,
                'withdrawable_balance' => 0,
                'token_balance' => 0,
                'lifetime_earnings' => 0,
            ]);
        });
    }

    private static function generateUniqueReferralCode(): string
    {
        do {
            $code = 'NX' . strtoupper(Str::random(6));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    public function wallet(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function investments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function referralEarnings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ReferralEarning::class, 'referrer_id');
    }

    public function miningLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MiningLog::class);
    }

    public function transactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function referredBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function referredUsers(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'referred_by_id');
    }

    public function otpCodes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OtpCode::class);
    }

    public function generateEmailOtp(): OtpCode
    {
        $this->otpCodes()->where('type', 'email_verification')->whereNull('used_at')->update(['used_at' => now()]);

        return $this->otpCodes()->create([
            'code' => str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT),
            'type' => 'email_verification',
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);
    }

    public function sendEmailVerificationNotification(): void
    {
        $otp = $this->generateEmailOtp();
        $this->notify(new SendEmailOtp($otp->code));
    }

    public function hasVerifiedEmail(): bool
    {
        return !is_null($this->email_verified_at);
    }

    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    public function getEmailForVerification(): string
    {
        return $this->email;
    }

    public function generatePhoneOtp(): OtpCode
    {
        $this->otpCodes()->where('type', 'phone_verification')->whereNull('used_at')->update(['used_at' => now()]);

        $otp = $this->otpCodes()->create([
            'code' => str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT),
            'type' => 'phone_verification',
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        $fullNumber = $this->country_code . $this->phone;
        $message = "Votre code de verification Nexus Invest : {$otp->code}";

        $sms = app(\App\Services\SmsService::class);
        $sent = $sms->send($fullNumber, $message);

        Log::channel('audit')->info('PHONE_OTP', [
            'user_id' => $this->id,
            'phone' => $fullNumber,
            'code' => $otp->code,
            'sms_sent' => $sent,
        ]);

        return $otp;
    }

    public function hasVerifiedPhone(): bool
    {
        return !is_null($this->phone_verified_at);
    }

    public function markPhoneAsVerified(): bool
    {
        return $this->forceFill([
            'phone_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));
        $url = $frontendUrl . '/reinitialiser-mot-de-passe?token=' . $token . '&email=' . urlencode($this->email);

        $this->notify(new \App\Notifications\ResetPasswordNotification($url));
    }
}
