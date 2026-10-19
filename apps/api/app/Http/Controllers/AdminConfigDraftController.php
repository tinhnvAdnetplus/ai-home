<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\DiscardConfigDraft;
use App\Actions\SaveConfigDraft;
use App\Http\Requests\SaveConfigDraftRequest;
use App\Http\Resources\ConfigVersionResource;
use App\Support\RequestId;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdminConfigDraftController extends Controller
{
    /**
     * Create or update a draft configuration version with optimistic concurrency.
     */
    public function update(
        SaveConfigDraftRequest $request,
        string $key,
        SaveConfigDraft $action
    ): JsonResponse {
        /** @var array{payload: array<string, mixed>, label?: string|null} $validated */
        $validated = $request->validated();
        $payload = $validated['payload'];
        $label = $validated['label'] ?? null;

        $user = $request->user();
        $userId = $user?->id;
        $requestId = RequestId::resolve($request);
        $ifMatch = $request->header('If-Match');

        $result = $action->handle(
            key: $key,
            payload: $payload,
            label: $label,
            userId: $userId,
            requestId: $requestId,
            ifMatch: $ifMatch
        );

        $resource = (new ConfigVersionResource($result['draft']))->withPayload()->toArray($request);
        $statusCode = $result['created'] ? 201 : 200;

        return new JsonResponse(
            data: $resource,
            status: $statusCode,
            headers: ['ETag' => $result['etag']],
            options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }

    /**
     * Discard an active draft configuration version.
     */
    public function destroy(
        Request $request,
        string $key,
        DiscardConfigDraft $action
    ): Response {
        $user = $request->user();
        $userId = $user?->id;
        $requestId = RequestId::resolve($request);

        $action->handle(
            key: $key,
            userId: $userId,
            requestId: $requestId
        );

        return new Response('', 204);
    }
}
