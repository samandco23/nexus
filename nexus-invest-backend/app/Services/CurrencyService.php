<?php

namespace App\Services;

use App\Models\SystemSetting;

class CurrencyService
{
    private float $usdToXafRate;
    private float $tokenValueUsd;
    private float $tokenWeeklyAppreciation;

    public function __construct()
    {
        $this->usdToXafRate = (float) SystemSetting::getValue('usd_to_xaf_rate', 600);
        $this->tokenValueUsd = (float) SystemSetting::getValue('token_initial_value_usd', 0.10);
        $this->tokenWeeklyAppreciation = (float) SystemSetting::getValue('token_weekly_appreciation', 2);
    }

    public function usdToXaf(float $usd): float
    {
        return round($usd * $this->usdToXafRate, 2);
    }

    public function xafToUsd(float $xaf): float
    {
        return round($xaf / $this->usdToXafRate, 2);
    }

    public function tokensToFiat(float $tokens, int $weeksSinceStart = 0): float
    {
        $currentTokenValue = $this->getCurrentTokenValue($weeksSinceStart);
        return round($tokens * $currentTokenValue * $this->usdToXafRate, 2);
    }

    public function fiatToTokens(float $amountXaf, int $weeksSinceStart = 0): float
    {
        $currentTokenValue = $this->getCurrentTokenValue($weeksSinceStart);
        return round($amountXaf / ($currentTokenValue * $this->usdToXafRate), 4);
    }

    public function getCurrentTokenValue(int $weeksSinceStart = 0): float
    {
        $value = $this->tokenValueUsd;
        for ($i = 0; $i < $weeksSinceStart; $i++) {
            $value *= (1 + $this->tokenWeeklyAppreciation / 100);
        }
        return round($value, 4);
    }

    public function getUsdToXafRate(): float
    {
        return $this->usdToXafRate;
    }
}
