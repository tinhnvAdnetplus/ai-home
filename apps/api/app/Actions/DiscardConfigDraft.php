<?php

declare(strict_types=1);

namespace App\Actions;

use App\Config\ConfigDocumentRegistry;
use App\Enums\ConfigAuditAction;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class DiscardConfigDraft
{
    public function __construct(
        private readonly RecordConfigAudit $recordAudit
    ) {
    }

    /**
     * Discard an active draft configuration version and audit the action.
     */
    public function handle(string $key, ?int $userId = null, ?string $requestId = null): void
    {
        if (! ConfigDocumentRegistry::has($key)) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        DB::transaction(function () use ($key, $userId, $requestId): void {
            $document = ConfigDocument::where('key', $key)->lockForUpdate()->first();
            if ($document === null) {
                throw new NotFoundHttpException("Configuration document '{$key}' not found.");
            }

            /** @var ConfigVersion|null $draft */
            $draft = ConfigVersion::where('config_document_id', $document->id)
                ->where('is_draft', true)
                ->lockForUpdate()
                ->first();

            if ($draft === null) {
                throw new NotFoundHttpException("No active draft found for configuration '{$key}'.");
            }

            $this->recordAudit->handle(
                $document,
                ConfigAuditAction::DiscardDraft,
                $draft,
                $userId,
                $requestId,
                [
                    'version' => $draft->version,
                    'label' => $draft->label,
                ]
            );

            $draft->delete();
        });
    }
}
