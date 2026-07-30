<?php

use App\Jobs\PayWeeklyGains;
use Illuminate\Support\Facades\Schedule;

Schedule::command('otp:clear-expired')->daily();

Schedule::job(new PayWeeklyGains)
    ->weekly()
    ->fridays()
    ->at('12:00')
    ->timezone('UTC')
    ->name('pay-weekly-gains')
    ->withoutOverlapping();
