<?php

use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\InvestmentController as AdminInvestmentController;
use App\Http\Controllers\Api\V1\Admin\InvestmentPackController as AdminInvestmentPackController;
use App\Http\Controllers\Api\V1\Admin\KycController as AdminKycController;
use App\Http\Controllers\Api\V1\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\Admin\WithdrawalController as AdminWithdrawalController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\InvestmentController;
use App\Http\Controllers\Api\V1\InvestmentPackController;
use App\Http\Controllers\Api\V1\KycController;
use App\Http\Controllers\Api\V1\MiningController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReferralController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\WithdrawalController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'data' => [
                'status' => 'healthy',
                'timestamp' => now()->toIso8601String(),
                'version' => '1.0.0',
            ],
        ]);
    });

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,60');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,60');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,60');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,60');

            Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/me', [AuthController::class, 'updateMe'])->middleware('throttle:10,60');
            Route::put('/password', [AuthController::class, 'updatePassword'])->middleware('throttle:5,60');
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:10,60');
            Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:10,60');
            Route::post('/verify-phone', [AuthController::class, 'verifyPhone'])->middleware('throttle:10,60');
            Route::post('/resend-phone-otp', [AuthController::class, 'resendPhoneOtp'])->middleware('throttle:10,60');
            Route::delete('/account', [AuthController::class, 'deleteAccount'])->middleware('throttle:3,60');
            Route::get('/export', [AuthController::class, 'exportData'])->middleware('throttle:5,60');
        });
    });

    Route::post('/investments/callback', [InvestmentController::class, 'callback'])->middleware('throttle:10,60');
    Route::get('/investment-packs', [InvestmentPackController::class, 'index']);

    Route::middleware(['auth:sanctum', 'user.status'])->group(function () {
        Route::get('/investments/active', [InvestmentController::class, 'activeInvestments']);
        Route::apiResource('investments', InvestmentController::class)->except(['update', 'destroy']);

        Route::get('/mining/status', [MiningController::class, 'status']);
        Route::post('/mining/start', [MiningController::class, 'start']);
        Route::post('/mining/claim', [MiningController::class, 'claim']);
        Route::get('/mining/history', [MiningController::class, 'history']);
        Route::post('/mining/convert', [MiningController::class, 'convertTokens']);

        Route::get('/referrals', [ReferralController::class, 'index']);
        Route::get('/referrals/tree', [ReferralController::class, 'tree']);
        Route::put('/referrals/code', [ReferralController::class, 'updateCode']);

        Route::get('/wallet', [WalletController::class, 'show']);
        Route::get('/wallet/transactions', [WalletController::class, 'transactions']);

        Route::get('/withdrawals', [WithdrawalController::class, 'index']);
        Route::post('/withdrawals', [WithdrawalController::class, 'store'])->middleware('throttle:5,60');
        Route::put('/withdrawals/{withdrawal_request}/cancel', [WithdrawalController::class, 'cancel']);

        Route::prefix('chat')->group(function () {
            Route::get('/rooms', [ChatController::class, 'rooms']);
            Route::get('/rooms/{room}', [ChatController::class, 'messages']);
            Route::post('/rooms/{room}', [ChatController::class, 'send'])->middleware('throttle:20,60');
        });

        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
            Route::post('/{id}/read', [NotificationController::class, 'markRead']);
            Route::post('/read-all', [NotificationController::class, 'markAllRead']);
        });

        Route::prefix('kyc')->group(function () {
            Route::get('/status', [KycController::class, 'status']);
            Route::post('/upload', [KycController::class, 'upload']);
        });
    });

    Route::middleware(['auth:sanctum', 'user.status', 'admin', 'throttle:30,60'])->prefix('admin')->group(function () {
        Route::get('/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/activities', [AdminDashboardController::class, 'activities']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::put('/users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus']);
        Route::get('/investments', [AdminInvestmentController::class, 'index']);
        Route::get('/withdrawals', [AdminWithdrawalController::class, 'index']);
        Route::put('/withdrawals/{withdrawal_request}/approve', [AdminWithdrawalController::class, 'approve']);
        Route::put('/withdrawals/{withdrawal_request}/reject', [AdminWithdrawalController::class, 'reject']);
        Route::get('/settings', [AdminDashboardController::class, 'settings']);
        Route::put('/settings/{key}', [AdminDashboardController::class, 'updateSetting']);
        Route::post('/notifications/send', [AdminNotificationController::class, 'send']);
        Route::get('/packs', [AdminInvestmentPackController::class, 'index']);
        Route::get('/packs/{investmentPack}', [AdminInvestmentPackController::class, 'show']);
        Route::post('/packs', [AdminInvestmentPackController::class, 'store']);
        Route::put('/packs/{investmentPack}', [AdminInvestmentPackController::class, 'update']);
        Route::delete('/packs/{investmentPack}', [AdminInvestmentPackController::class, 'destroy']);
        Route::get('/kyc', [AdminKycController::class, 'index']);
        Route::post('/kyc/{kyc_document}/approve', [AdminKycController::class, 'approve']);
        Route::post('/kyc/{kyc_document}/reject', [AdminKycController::class, 'reject']);
    });
});
