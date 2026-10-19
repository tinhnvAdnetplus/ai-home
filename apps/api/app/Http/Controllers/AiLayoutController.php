<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GenerateAiLayout;
use App\Http\Requests\AiLayoutRequest;
use App\Support\RequestId;
use Illuminate\Http\JsonResponse;

final class AiLayoutController extends Controller
{
    public function __invoke(AiLayoutRequest $request, GenerateAiLayout $action): JsonResponse
    {
        $requestId = RequestId::resolve($request);
        /** @var array<string, mixed> $context */
        $context = $request->input('context', []);
        /** @var list<string> $issues */
        $issues = $request->input('issues', []) ?? [];
        /** @var array<string, mixed>|null $previous */
        $previous = $request->input('previousLayout');

        $result = $action->handle($context, $issues, $previous, $request->user(), $requestId);

        return new JsonResponse($result, 200, [
            RequestId::HEADER => $requestId,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
