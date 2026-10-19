<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GeneratePlanCommentary;
use App\Http\Requests\AiCommentaryRequest;
use App\Support\RequestId;
use Illuminate\Http\JsonResponse;

final class AiCommentaryController extends Controller
{
    public function __invoke(AiCommentaryRequest $request, GeneratePlanCommentary $action): JsonResponse
    {
        $requestId = RequestId::resolve($request);
        /** @var array<string, mixed> $answers */
        $answers = $request->input('answers', []);
        /** @var array<string, mixed> $constraints */
        $constraints = $request->input('constraints', []);
        /** @var list<array<string, mixed>> $plans */
        $plans = $request->input('plans', []);

        $result = $action->handle(
            answers: $answers,
            constraints: $constraints,
            plans: $plans,
            user: $request->user(),
            requestId: $requestId,
        );

        return new JsonResponse($result, 200, [
            RequestId::HEADER => $requestId,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
