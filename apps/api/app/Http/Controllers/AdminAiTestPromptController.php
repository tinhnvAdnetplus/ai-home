<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TestAiPrompt;
use App\Http\Requests\AdminAiTestPromptRequest;
use Illuminate\Http\JsonResponse;

class AdminAiTestPromptController extends Controller
{
    public function __invoke(AdminAiTestPromptRequest $request, TestAiPrompt $action): JsonResponse
    {
        /** @var array{which: string, prompt?: string|null, answers: array<string, mixed>} $validated */
        $validated = $request->validated();
        $which = $validated['which'];
        $prompt = $validated['prompt'] ?? null;
        $answers = $validated['answers'];

        $result = $action->handle($which, $prompt, $answers);

        return new JsonResponse($result, 200, [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
