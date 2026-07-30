<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Investment;
use App\Models\SystemSetting;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WithdrawalRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use LogsActivity;

    public function stats(): JsonResponse
    {
        try {
            $totalUsers = User::count();
            $activeUsers = User::where('status', 'active')->count();
            $totalInvested = Investment::where('status', 'active')->sum('amount_invested');
            $activeInvestments = Investment::where('status', 'active')->count();
            $pendingWithdrawals = WithdrawalRequest::where('status', 'pending')->count();
            $totalWithdrawn = WithdrawalRequest::where('status', 'completed')->sum('amount');

            $todayStart = now()->startOfDay();
            $todayEnd = now()->endOfDay();

            $dailyInvested = Investment::where('status', 'active')
                ->whereBetween('created_at', [$todayStart, $todayEnd])
                ->sum('amount_invested');

            $dailyDeposited = Transaction::where('type', 'deposit')
                ->where('status', 'completed')
                ->whereBetween('created_at', [$todayStart, $todayEnd])
                ->sum('amount');

            $dailyWithdrawn = WithdrawalRequest::where('status', 'completed')
                ->whereBetween('updated_at', [$todayStart, $todayEnd])
                ->sum('amount');

            $recentUsers = User::latest()->take(5)->get()->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->first_name . ' ' . $u->last_name,
                'email' => $u->email,
                'created_at' => $u->created_at,
            ]);

            $recentActivities = ActivityLog::with('user')
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'type' => $log->type,
                    'detail' => $log->description,
                    'timestamp' => $log->created_at,
                    'user' => $log->user ? $log->user->first_name . ' ' . $log->user->last_name : null,
                ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => $totalUsers,
                    'active_users' => $activeUsers,
                    'total_invested' => (float) $totalInvested,
                    'active_investments' => $activeInvestments,
                    'pending_withdrawals' => $pendingWithdrawals,
                    'total_withdrawn' => (float) $totalWithdrawn,
                    'daily_invested' => (float) $dailyInvested,
                    'daily_deposited' => (float) $dailyDeposited,
                    'daily_withdrawn' => (float) $dailyWithdrawn,
                    'recent_users' => $recentUsers,
                    'recent_activities' => $recentActivities,
                ],
                'message' => 'Statistiques récupérées.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des statistiques.',
            ], 500);
        }
    }

    public function activities(Request $request): JsonResponse
    {
        try {
            $perPage = min((int) ($request->get('per_page', 50)), 100);
            $type = $request->get('type');
            $userId = $request->get('user_id');

            $query = ActivityLog::with('user')->latest();

            if ($type) {
                $query->where('type', $type);
            }

            if ($userId) {
                $query->where('user_id', $userId);
            }

            $logs = $query->paginate($perPage);

            $logs->getCollection()->transform(fn ($log) => [
                'id' => $log->id,
                'type' => $log->type,
                'description' => $log->description,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->first_name . ' ' . $log->user->last_name,
                    'email' => $log->user->email,
                ] : null,
                'ip_address' => $log->ip_address,
                'metadata' => $log->metadata,
                'created_at' => $log->created_at,
            ]);

            return response()->json([
                'success' => true,
                'data' => $logs,
                'message' => 'Activités récupérées.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching activities: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des activités.',
            ], 500);
        }
    }

    public function settings(): JsonResponse
    {
        try {
            $keys = ['token_value_xaf', 'mining_base_rate', 'min_withdrawal', 'referral_bonus_percent'];
            $settings = [];
            foreach ($keys as $key) {
                $setting = SystemSetting::where('key', $key)->first();
                $settings[$key] = $setting ? $setting->value : config('app.defaults.' . $key, null);
            }

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Paramètres récupérés.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la récupération des paramètres.',
            ], 500);
        }
    }

    public function updateSetting(Request $request, string $key): JsonResponse
    {
        try {
            $validKeys = ['token_value_xaf', 'mining_base_rate', 'min_withdrawal', 'referral_bonus_percent'];

            if (!in_array($key, $validKeys)) {
                return response()->json([
                    'success' => false,
                    'data' => null,
                    'message' => 'Clé de paramètre invalide.',
                ], 400);
            }

            $validated = $request->validate([
                'value' => 'required|numeric|min:0',
            ]);

            SystemSetting::setValue($key, (string) $validated['value'], 'Mis à jour par admin');

            Log::channel('audit')->info('Admin updated setting', [
                'admin_id' => $request->user()->id,
                'key' => $key,
                'value' => $validated['value'],
            ]);

            return response()->json([
                'success' => true,
                'data' => ['key' => $key, 'value' => $validated['value']],
                'message' => 'Paramètre mis à jour.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Erreur lors de la mise à jour.',
            ], 500);
        }
    }

    private function parseLogLine(string $line): array
    {
        if (preg_match('/^\[(\d{4}-\d{2}-\d{2}[^\]]+)\] (\w+)\.(\w+): (.+)$/', $line, $m)) {
            return [
                'timestamp' => $m[1],
                'channel' => $m[2],
                'level' => $m[3],
                'message' => $m[4],
            ];
        }
        return ['timestamp' => null, 'channel' => null, 'level' => null, 'message' => $line];
    }
}
