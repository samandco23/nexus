<?php

namespace App\Console;

use App\Jobs\PayWeeklyGains;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->job(new PayWeeklyGains)
            ->weekly()
            ->fridays()
            ->at('12:00')
            ->timezone('UTC')
            ->name('pay-weekly-gains')
            ->withoutOverlapping();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
