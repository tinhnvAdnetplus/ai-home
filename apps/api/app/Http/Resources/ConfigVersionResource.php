<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ConfigVersion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ConfigVersion $resource
 */
final class ConfigVersionResource extends JsonResource
{
    private bool $includePayload = true;

    public function withoutPayload(): self
    {
        $this->includePayload = false;

        return $this;
    }

    public function withPayload(bool $include = true): self
    {
        $this->includePayload = $include;

        return $this;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ConfigVersion $version */
        $version = $this->resource;

        $data = [
            'id' => $version->id,
            'version' => $version->version,
            'status' => $version->status->value,
            'isDraft' => $version->is_draft,
            'is_draft' => $version->is_draft,
            'schemaVersion' => $version->schema_version,
            'schema_version' => $version->schema_version,
            'payloadHash' => $version->payload_hash,
            'payload_hash' => $version->payload_hash,
            'label' => $version->label,
            'createdBy' => $version->created_by,
            'created_by' => $version->created_by,
            'publishedBy' => $version->published_by,
            'published_by' => $version->published_by,
            'basedOnVersionId' => $version->based_on_version_id,
            'based_on_version_id' => $version->based_on_version_id,
            'publishedAt' => $version->published_at?->toISOString(),
            'published_at' => $version->published_at?->toISOString(),
            'createdAt' => $version->created_at?->toISOString(),
            'created_at' => $version->created_at?->toISOString(),
            'updatedAt' => $version->updated_at?->toISOString(),
            'updated_at' => $version->updated_at?->toISOString(),
        ];

        if ($version->is_draft) {
            $etag = ConfigVersion::computeDraftEtag($version);
            $data['etag'] = $etag;
        }

        if ($this->includePayload) {
            $data['payload'] = $version->payload;
        }

        return $data;
    }
}
