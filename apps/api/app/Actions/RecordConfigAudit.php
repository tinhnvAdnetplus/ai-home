<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ConfigAuditAction;
use App\Models\ConfigAuditLog;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use Illuminate\Support\Carbon;

final class RecordConfigAudit
{
    /**
     * Record an append-only configuration audit log entry.
     *
     * @param  array<string, mixed>|null  $summary
     */
    public function handle(
        ConfigDocument $document,
        ConfigAuditAction $action,
        ?ConfigVersion $version = null,
        ?int $userId = null,
        ?string $requestId = null,
        ?array $summary = null
    ): ConfigAuditLog {
        return ConfigAuditLog::create([
            'config_document_id' => $document->id,
            'config_version_id' => $version?->id,
            'user_id' => $userId,
            'action' => $action,
            'summary' => $summary,
            'request_id' => $requestId,
            'created_at' => Carbon::now('UTC'),
        ]);
    }
}
