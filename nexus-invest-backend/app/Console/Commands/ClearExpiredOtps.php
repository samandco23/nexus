<?php
namespace App\Console\Commands;

use App\Models\OtpCode;
use Illuminate\Console\Command;

class ClearExpiredOtps extends Command
{
    protected $signature = 'otp:clear-expired';
    protected $description = 'Supprime les codes OTP expirés';

    public function handle(): void
    {
        OtpCode::where('expires_at', '<', now())->orWhereNotNull('used_at')->delete();
        $this->info('OTPs expirés supprimés.');
    }
}
