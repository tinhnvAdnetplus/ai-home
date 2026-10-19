<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Config\ConfigDocumentRegistry;
use App\Http\Resources\ConfigAuditLogResource;
use App\Http\Resources\ConfigVersionResource;
use App\Http\Resources\PaginatedCollection;
use App\Models\ConfigAuditLog;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use App\Support\PaginationHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AdminConfigHistoryController extends Controller
{
    /**
     * List paginated version history for a configuration document (metadata only).
     */
    public function versions(Request $request, string $key): JsonResponse
    {
        if (! ConfigDocumentRegistry::has($key)) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        /** @var ConfigDocument|null $document */
        $document = ConfigDocument::where('key', $key)->first();
        if ($document === null) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        $params = PaginationHelper::paginateParams($request);

        /** @var \Illuminate\Pagination\LengthAwarePaginator<int, ConfigVersion> $paginator */
        $paginator = ConfigVersion::where('config_document_id', $document->id)
            ->orderByDesc('version')
            ->paginate(
                perPage: $params['per_page'],
                page: $params['page']
            );

        $paginator->through(
            fn (ConfigVersion $version): array => (new ConfigVersionResource($version))->withoutPayload()->toArray($request)
        );

        return (new PaginatedCollection($paginator))->response();
    }

    /**
     * Retrieve a specific version by version number (with payload).
     */
    public function version(Request $request, string $key, int $n): JsonResponse
    {
        if (! ConfigDocumentRegistry::has($key)) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        /** @var ConfigDocument|null $document */
        $document = ConfigDocument::where('key', $key)->first();
        if ($document === null) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        /** @var ConfigVersion|null $version */
        $version = ConfigVersion::where('config_document_id', $document->id)
            ->where('version', $n)
            ->first();

        if ($version === null) {
            throw new NotFoundHttpException("Version {$n} not found for configuration '{$key}'.");
        }

        $resource = (new ConfigVersionResource($version))->withPayload()->toArray($request);

        return new JsonResponse(
            data: $resource,
            status: 200,
            headers: [],
            options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }

    /**
     * List paginated audit history for a configuration document.
     */
    public function audit(Request $request, string $key): JsonResponse
    {
        if (! ConfigDocumentRegistry::has($key)) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        /** @var ConfigDocument|null $document */
        $document = ConfigDocument::where('key', $key)->first();
        if ($document === null) {
            throw new NotFoundHttpException("Configuration document '{$key}' not found.");
        }

        $params = PaginationHelper::paginateParams($request);

        /** @var \Illuminate\Pagination\LengthAwarePaginator<int, ConfigAuditLog> $paginator */
        $paginator = ConfigAuditLog::where('config_document_id', $document->id)
            ->with(['user', 'version'])
            ->orderByDesc('id')
            ->paginate(
                perPage: $params['per_page'],
                page: $params['page']
            );

        $paginator->through(
            fn (ConfigAuditLog $log): array => (new ConfigAuditLogResource($log))->toArray($request)
        );

        return (new PaginatedCollection($paginator))->response();
    }
}
