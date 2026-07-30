<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Log;

trait LogsActivity
{
    protected function logActivity(
        string $type,
        string $description,
        ?int $userId = null,
        ?array $metadata = null,
        bool $auditLog = true
    ): ActivityLog {
        $log = ActivityLog::create([
            'user_id' => $userId ?? request()->user()?->id,
            'type' => $type,
            'description' => $description,
            'ip_address' => request()->ip(),
            'metadata' => $metadata,
        ]);

        if ($auditLog) {
            Log::channel('audit')->info($description, [
                'user_id' => $log->user_id,
                'type' => $type,
                'metadata' => $metadata,
                'ip' => $log->ip_address,
            ]);
        }

        return $log;
    }
}
