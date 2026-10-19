<?php

declare(strict_types=1);

namespace App\Ai\Providers;

use App\Ai\Dto\LlmRequest;
use App\Ai\Dto\LlmResult;
use App\Ai\LlmProvider;
use Illuminate\Support\Facades\Log;
use Throwable;

final class FallbackProvider implements LlmProvider
{
    public function __construct(
        private readonly LlmProvider $primary,
        private readonly LocalHeuristicProvider $fallback,
        private readonly string $primaryName = 'gemini',
    ) {
    }

    public function generateJson(LlmRequest $req): LlmResult
    {
        try {
            $result = $this->primary->generateJson($req);

            return new LlmResult(
                data: $result->data,
                usage: $result->usage,
                latencyMs: $result->latencyMs,
                provider: $result->provider,
                model: $result->model,
                source: $result->provider,
                degraded: false,
            );
        } catch (Throwable $e) {
            Log::warning("AI provider [{$this->primaryName}] failed, falling back to local heuristic: ".$e->getMessage(), [
                'provider' => $this->primaryName,
            ]);

            $fallbackResult = $this->fallback->generateJson($req);

            return new LlmResult(
                data: $fallbackResult->data,
                usage: $fallbackResult->usage,
                latencyMs: $fallbackResult->latencyMs,
                provider: $this->primaryName,
                model: $fallbackResult->model,
                source: 'local',
                degraded: true,
            );
        }
    }
}
