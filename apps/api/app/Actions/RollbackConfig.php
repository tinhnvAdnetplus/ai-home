<?php

declare(strict_types=1);

namespace App\Actions;

use App\Config\ConfigDocumentRegistry;
use App\Enums\ConfigAuditAction;
use App\Enums\ConfigVersionStatus;
use App\Exceptions\ConfigProblemException;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use App\Support\ApiErrorCode;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class RollbackConfig
{
    public function __construct(
        private readonly RecordConfigAudit $recordAudit
    ) {
    }

    /**
     * Roll back a configuration document to a previous version by creating a new published version.
     */
    public function handle(
        string $key,
        int $targetVersionNumber,
        ?int $userId = null,
        ?string $requestId = null
    ): ConfigVersion {
        if (! ConfigDocumentRegistry::has($key)) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        return DB::transaction(function () use ($key, $targetVersionNumber, $userId, $requestId): ConfigVersion {
            $document = ConfigDocument::where('key', $key)->lockForUpdate()->first();
            if ($document === null) {
                throw new NotFoundHttpException("Configuration document '{$key}' not found.");
            }

            /** @var ConfigVersion|null $targetVersion */
            $targetVersion = ConfigVersion::where('config_document_id', $document->id)
                ->where('version', $targetVersionNumber)
                ->first();

            if ($targetVersion === null) {
                throw new NotFoundHttpException("Version {$targetVersionNumber} not found.");
            }

            if ($document->current_version_id !== null && $document->current_version_id === $targetVersion->id) {
                throw new ConfigProblemException(
                    statusCode: 422,
                    errorCode: ApiErrorCode::VALIDATION_FAILED,
                    message: "Cannot rollback to version {$targetVersionNumber} as it is already the current published version."
                );
            }

            $validatorClass = ConfigDocumentRegistry::getValidator($key);
            if ($validatorClass !== null) {
                /** @var \App\Config\Wizard\ValidationResult $result */
                $result = $validatorClass::validate($targetVersion->payload);
                if (! $result->ok) {
                    throw ConfigProblemException::configInvalid(
                        $result->issues,
                        "Version {$targetVersionNumber} payload fails current validation rules."
                    );
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

            $maxVersion = (int) ConfigVersion::where('config_document_id', $document->id)->max('version');
            $newVersionNumber = $maxVersion + 1;

            $label = "Rollback to v{$targetVersion->version}";
            if ($targetVersion->label !== null && $targetVersion->label !== '') {
                $label .= " ({$targetVersion->label})";
            }
            if (mb_strlen($label) > 120) {
                $label = mb_substr($label, 0, 120);
            }

            $newVersion = new ConfigVersion();
            $newVersion->forceFill([
                'config_document_id' => $document->id,
                'version' => $newVersionNumber,
                'status' => ConfigVersionStatus::Published,
                'is_draft' => null,
                'schema_version' => $targetVersion->schema_version,
                'payload' => $targetVersion->payload,
                'payload_hash' => ConfigVersion::computePayloadHash($targetVersion->payload),
                'label' => $label,
                'created_by' => $userId,
                'published_by' => $userId,
                'based_on_version_id' => $targetVersion->id,
                'published_at' => Carbon::now('UTC'),
            ]);
            $newVersion->save();

            $document->forceFill([
                'current_version_id' => $newVersion->id,
            ]);
            $document->save();

            if ($key === 'ai') {
                app(\App\Ai\AiSettings::class)->bustCache();
            }

            $this->recordAudit->handle(
                $document,
                ConfigAuditAction::Rollback,
                $newVersion,
                $userId,
                $requestId,
                [
                    'new_version' => $newVersion->version,
                    'rolled_back_to_version' => $targetVersion->version,
                    'previous_version' => $prevPublished?->version,
                ]
            );

            return $newVersion;
        });
    }
}
