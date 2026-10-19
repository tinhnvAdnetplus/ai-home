<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Config\ConfigDocumentRegistry;
use App\Http\Resources\ConfigDocumentResource;
use App\Http\Resources\ConfigVersionResource;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AdminConfigController extends Controller
{
    /**
     * List all configuration documents and their current status.
     */
    public function index(Request $request): JsonResponse
    {
        $keys = ConfigDocumentRegistry::allKeys();

        /** @var \Illuminate\Database\Eloquent\Collection<string, ConfigDocument> $existing */
        $existing = ConfigDocument::whereIn('key', $keys)
            ->with(['currentVersion', 'draftVersion'])
            ->get()
            ->keyBy('key');

        $list = [];
        foreach ($keys as $key) {
            if ($existing->has($key)) {
                $doc = $existing->get($key);
                $list[] = (new ConfigDocumentResource($doc))->toArray($request);
            } else {
                $list[] = [
                    'id' => null,
                    'key' => $key,
                    'scope' => ConfigDocumentRegistry::getScope($key),
                    'currentPublishedVersion' => null,
                    'current_published_version' => null,
                    'publishedAt' => null,
                    'published_at' => null,
                    'hasDraft' => false,
                    'has_draft' => false,
                    'draftUpdatedAt' => null,
                    'draft_updated_at' => null,
                ];
            }
        }

        return new JsonResponse(
            data: ['data' => $list],
            status: 200,
            headers: [],
            options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }

    /**
     * Retrieve document details, published version, draft, and 20 recent versions.
     */
    public function show(Request $request, string $key): JsonResponse
    {
        if (! ConfigDocumentRegistry::has($key)) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        /** @var ConfigDocument|null $document */
        $document = ConfigDocument::where('key', $key)
            ->with(['currentVersion', 'draftVersion'])
            ->first();

        if ($document === null) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        /** @var \Illuminate\Database\Eloquent\Collection<int, ConfigVersion> $recentVersions */
        $recentVersions = ConfigVersion::where('config_document_id', $document->id)
            ->orderByDesc('version')
            ->limit(20)
            ->get();

        $recentList = [];
        foreach ($recentVersions as $version) {
            $recentList[] = (new ConfigVersionResource($version))->withoutPayload()->toArray($request);
        }

        $published = $document->currentVersion;
        $publishedData = $published !== null
            ? (new ConfigVersionResource($published))->withPayload()->toArray($request)
            : null;

        $draft = $document->draftVersion;
        $draftData = $draft !== null
            ? (new ConfigVersionResource($draft))->withPayload()->toArray($request)
            : null;

        $headers = [];
        if ($draft !== null) {
            $headers['ETag'] = ConfigVersion::computeDraftEtag($draft);
        }

        $responsePayload = [
            'key' => $document->key,
            'scope' => $document->scope,
            'published_version' => $publishedData,
            'publishedVersion' => $publishedData,
            'draft_version' => $draftData,
            'draft' => $draftData,
            'recent_versions' => $recentList,
            'recentVersions' => $recentList,
        ];

        return new JsonResponse(
            data: $responsePayload,
            status: 200,
            headers: $headers,
            options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }
}
