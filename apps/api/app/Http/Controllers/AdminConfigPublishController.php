<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\PublishConfigDraft;
use App\Actions\RollbackConfig;
use App\Http\Requests\PublishConfigRequest;
use App\Http\Requests\RollbackConfigRequest;
use App\Http\Resources\ConfigVersionResource;
use App\Support\RequestId;
use Illuminate\Http\JsonResponse;

class AdminConfigPublishController extends Controller
{
    /**
     * Publish an active draft configuration version.
     */
    public function publish(
        PublishConfigRequest $request,
        string $key,
        PublishConfigDraft $action
    ): JsonResponse {
        /** @var array{label?: string|null} $validated */
        $validated = $request->validated();
        $label = $validated['label'] ?? null;

        $user = $request->user();
        $userId = $user?->id;
        $requestId = RequestId::resolve($request);

        $publishedVersion = $action->handle(
            key: $key,
            label: $label,
            userId: $userId,
            requestId: $requestId
        );

        $resource = (new ConfigVersionResource($publishedVersion))->withPayload()->toArray($request);

        return new JsonResponse(
            data: $resource,
            status: 200,
            headers: [],
            options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }

    /**
     * Roll back a configuration document to a previous version.
     */
    public function rollback(
        RollbackConfigRequest $request,
        string $key,
        RollbackConfig $action
    ): JsonResponse {
        /** @var array{version: int} $validated */
        $validated = $request->validated();
        $version = $validated['version'];

        $user = $request->user();
        $userId = $user?->id;
        $requestId = RequestId::resolve($request);

        $newPublishedVersion = $action->handle(
            key: $key,
            targetVersionNumber: $version,
            userId: $userId,
            requestId: $requestId
        );

        $resource = (new ConfigVersionResource($newPublishedVersion))->withPayload()->toArray($request);

        return new JsonResponse(
            data: $resource,
            status: 200,
            headers: [],
            options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }
}
