<?php

declare(strict_types=1);

namespace App\Actions;

use App\Config\ConfigDocumentRegistry;
use App\Enums\ConfigAuditAction;
use App\Enums\ConfigVersionStatus;
use App\Exceptions\ConfigProblemException;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class PublishConfigDraft
{
    public function __construct(
        private readonly RecordConfigAudit $recordAudit
    ) {
    }

    /**
     * Publish an active draft configuration version inside a locked transaction.
     */
    public function handle(
        string $key,
        ?string $label = null,
        ?int $userId = null,
        ?string $requestId = null
    ): ConfigVersion {
        if (! ConfigDocumentRegistry::has($key)) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        return DB::transaction(function () use ($key, $label, $userId, $requestId): ConfigVersion {
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
                throw ConfigProblemException::noDraft("No active draft exists for configuration '{$key}'.");
            }

            $validatorClass = ConfigDocumentRegistry::getValidator($key);
            if ($validatorClass !== null) {
                /** @var \App\Config\Wizard\ValidationResult $result */
                $result = $validatorClass::validate($draft->payload);
                if (! $result->ok) {
                    throw ConfigProblemException::configInvalid($result->issues);
                }
            }

            /** @var ConfigVersion|null $prevPublished */
            $prevPublished = $document->current_version_id !== null
                ? ConfigVersion::where('id', $document->current_version_id)->lockForUpdate()->first()
                : null;

            if ($prevPublished !== null) {
                $prevPublished->forceFill([
                    'status' => ConfigVersionStatus::Archived,
                ]);
                $prevPublished->save();
            }

            $newHash = ConfigVersion::computePayloadHash($draft->payload);
            $isUnchanged = $prevPublished !== null && hash_equals($prevPublished->payload_hash, $newHash);

            $draft->forceFill([
                'status' => ConfigVersionStatus::Published,
                'is_draft' => null,
                'published_by' => $userId,
                'published_at' => Carbon::now('UTC'),
                'payload_hash' => $newHash,
                'label' => $label ?? $draft->label,
            ]);
            $draft->save();

            $document->forceFill([
                'current_version_id' => $draft->id,
            ]);
            $document->save();

            if ($key === 'ai') {
                app(\App\Ai\AiSettings::class)->bustCache();
            }

            $this->recordAudit->handle(
                $document,
                ConfigAuditAction::Publish,
                $draft,
                $userId,
                $requestId,
                [
                    'version' => $draft->version,
                    'label' => $draft->label,
                    'unchanged_payload' => $isUnchanged,
                    'previous_version' => $prevPublished?->version,
                ]
            );

            return $draft;
        });
    }
}
