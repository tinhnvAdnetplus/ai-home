<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GetAiUsage;
use App\Support\RequestId;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AdminAiUsageController extends Controller
{
    public function __invoke(Request $request, GetAiUsage $action): JsonResponse
    {
        $requestId = RequestId::resolve($request);
        $result = $action->handle();

        return new JsonResponse($result, 200, [
            RequestId::HEADER => $requestId,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
