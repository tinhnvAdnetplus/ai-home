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
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class SaveConfigDraft
{
    public function __construct(
        private readonly RecordConfigAudit $recordAudit
    ) {
    }

    /**
     * Compute a strong ETag for a draft version.
     */
    public static function computeDraftEtag(ConfigVersion $draft): string
    {
        return ConfigVersion::computeDraftEtag($draft);
    }

    /**
     * Save (create or update) a draft configuration version.
     *
     * @param  array<string, mixed>  $payload
     * @return array{draft: ConfigVersion, created: bool, etag: string}
     */
    public function handle(
        string $key,
        array $payload,
        ?string $label = null,
        ?int $userId = null,
        ?string $requestId = null,
        ?string $ifMatch = null
    ): array {
        if (! ConfigDocumentRegistry::has($key)) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($encoded === false || strlen($encoded) > 1_048_576) {
            throw new ConfigProblemException(
                statusCode: 413,
                errorCode: ApiErrorCode::PAYLOAD_TOO_LARGE,
                message: 'Configuration payload exceeds 1 MB limit.'
            );
        }

        $validatorClass = ConfigDocumentRegistry::getValidator($key);
        if ($validatorClass !== null) {
            /** @var \App\Config\Wizard\ValidationResult $result */
            $result = $validatorClass::validate($payload);
            if (! $result->ok) {
                throw ConfigProblemException::configInvalid($result->issues);
            }
            /** @var array<string, mixed> $payload */
            $payload = $result->data ?? $payload;
        }

        return DB::transaction(function () use ($key, $payload, $label, $userId, $requestId, $ifMatch): array {
            $document = ConfigDocument::where('key', $key)->lockForUpdate()->first();

            if ($document === null) {
                $document = ConfigDocument::create([
                    'key' => $key,
                    'scope' => ConfigDocumentRegistry::getScope($key),
                ]);
                $document = ConfigDocument::where('id', $document->id)->lockForUpdate()->firstOrFail();
            }

            /** @var ConfigVersion|null $draft */
            $draft = ConfigVersion::where('config_document_id', $document->id)
                ->where('is_draft', true)
                ->lockForUpdate()
                ->first();

            if ($draft !== null) {
                if ($ifMatch === null || trim($ifMatch) === '') {
                    throw ConfigProblemException::preconditionRequired('If-Match header is required to update an existing draft.');
                }

                $currentEtag = self::computeDraftEtag($draft);
                if (! hash_equals(trim($currentEtag, '"'), trim($ifMatch, '"'))) {
                    throw ConfigProblemException::preconditionFailed('Draft has been modified concurrently. Precondition failed.');
                }

                $payloadHash = ConfigVersion::computePayloadHash($payload);
                $schemaVersion = (int) ($payload['schemaVersion'] ?? $draft->schema_version);

                $draft->forceFill([
                    'payload' => $payload,
                    'payload_hash' => $payloadHash,
                    'schema_version' => $schemaVersion,
                    'label' => $label ?? $draft->label,
                ]);
                $draft->save();

                $this->recordAudit->handle(
                    $document,
                    ConfigAuditAction::UpdateDraft,
                    $draft,
                    $userId,
                    $requestId,
                    [
                        'version' => $draft->version,
                        'label' => $draft->label,
                    ]
                );

                return [
                    'draft' => $draft,
                    'created' => false,
                    'etag' => self::computeDraftEtag($draft),
                ];
            }

            $maxVersion = (int) ConfigVersion::where('config_document_id', $document->id)->max('version');
            $newVersion = $maxVersion + 1;
            $payloadHash = ConfigVersion::computePayloadHash($payload);
            $schemaVersion = (int) ($payload['schemaVersion'] ?? 1);

            $newDraft = new ConfigVersion();
            $newDraft->forceFill([
                'config_document_id' => $document->id,
                'version' => $newVersion,
                'status' => ConfigVersionStatus::Draft,
                'is_draft' => true,
                'schema_version' => $schemaVersion,
                'payload' => $payload,
                'payload_hash' => $payloadHash,
                'label' => $label,
                'created_by' => $userId,
                'based_on_version_id' => $document->current_version_id,
            ]);

            try {
                $newDraft->save();
            } catch (QueryException $e) {
                throw ConfigProblemException::conflict('A draft was created concurrently.');
            }

            $this->recordAudit->handle(
                $document,
                ConfigAuditAction::CreateDraft,
                $newDraft,
                $userId,
                $requestId,
                [
                    'version' => $newDraft->version,
                    'label' => $newDraft->label,
                ]
            );

            return [
                'draft' => $newDraft,
                'created' => true,
                'etag' => self::computeDraftEtag($newDraft),
            ];
        });
    }
}
