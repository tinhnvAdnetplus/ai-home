<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ConfigAuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ConfigAuditLog $resource
 */
final class ConfigAuditLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ConfigAuditLog $log */
        $log = $this->resource;

        return [
            'id' => $log->id,
            'action' => $log->action->value,
            'version' => $log->version !== null ? $log->version->version : ($log->summary['version'] ?? null),
            'user' => $log->user !== null ? [
                'id' => $log->user->id,
                'name' => $log->user->name,
            ] : null,
            'summary' => $log->summary,
            'requestId' => $log->request_id,
            'request_id' => $log->request_id,
            'createdAt' => $log->created_at?->toISOString(),
            'created_at' => $log->created_at?->toISOString(),
        ];
    }
}
