<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ConfigDocument;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ConfigDocument $resource
 */
final class ConfigDocumentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ConfigDocument $doc */
        $doc = $this->resource;
        $published = $doc->currentVersion;
        $draft = $doc->draftVersion;

        return [
            'id' => $doc->id,
            'key' => $doc->key,
            'scope' => $doc->scope,
            'currentPublishedVersion' => $published?->version,
            'current_published_version' => $published?->version,
            'publishedAt' => $published?->published_at?->toISOString(),
            'published_at' => $published?->published_at?->toISOString(),
            'hasDraft' => $draft !== null,
            'has_draft' => $draft !== null,
            'draftUpdatedAt' => $draft?->updated_at?->toISOString(),
            'draft_updated_at' => $draft?->updated_at?->toISOString(),
        ];
    }
}
