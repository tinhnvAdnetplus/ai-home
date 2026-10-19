<?php

declare(strict_types=1);

namespace App\Actions;

use App\Config\ConfigDocumentRegistry;
use App\Enums\ConfigVersionStatus;
use App\Models\ConfigDocument;
use stdClass;

final class BuildConfigBundle
{
    /**
     * Build the public configuration bundle containing only published versions.
     *
     * @return array{
     *     etag: string,
     *     raw_etag: string,
     *     configs: array<string, array{version: int, schemaVersion: int, publishedAt: string|null, payload: array<string, mixed>}>|stdClass
     * }
     */
    public function handle(): array
    {
        $keys = ConfigDocumentRegistry::allKeys();

        /** @var \Illuminate\Database\Eloquent\Collection<int, ConfigDocument> $documents */
        $documents = ConfigDocument::whereIn('key', $keys)
            ->whereNotNull('current_version_id')
            ->with('currentVersion')
            ->orderBy('key')
            ->get();

        $configs = [];
        $etagComponents = [];

        foreach ($documents as $document) {
            $version = $document->currentVersion;
            if ($version === null || $version->status !== ConfigVersionStatus::Published) {
                continue;
            }

            $configs[$document->key] = [
                'version' => $version->version,
                'schemaVersion' => $version->schema_version,
                'publishedAt' => $version->published_at?->toISOString() ?? $version->created_at?->toISOString(),
                'payload' => $version->payload,
            ];

            $etagComponents[] = "{$document->key}:{$version->id}:{$version->payload_hash}";
        }

        if (empty($etagComponents)) {
            $rawEtag = hash('sha256', 'empty-config-bundle');
            $etag = '"'.$rawEtag.'"';

            return [
                'etag' => $etag,
                'raw_etag' => $rawEtag,
                'configs' => new stdClass(),
            ];
        }

        $rawEtag = hash('sha256', implode('|', $etagComponents));
        $etag = '"'.$rawEtag.'"';

        return [
            'etag' => $etag,
            'raw_etag' => $rawEtag,
            'configs' => $configs,
        ];
    }
}
