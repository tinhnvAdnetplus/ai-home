<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GenerateDesignConstraints;
use App\Http\Requests\AiConstraintsRequest;
use App\Support\RequestId;
use Illuminate\Http\JsonResponse;

final class AiConstraintsController extends Controller
{
    public function __invoke(AiConstraintsRequest $request, GenerateDesignConstraints $action): JsonResponse
    {
        $requestId = RequestId::resolve($request);
        /** @var array<string, mixed> $answers */
        $answers = $request->input('answers', []);
        $locale = (string) $request->input('locale', 'ja');

        $result = $action->handle(
            answers: $answers,
            locale: $locale,
            user: $request->user(),
            requestId: $requestId,
        );

        return new JsonResponse($result, 200, [
            RequestId::HEADER => $requestId,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
