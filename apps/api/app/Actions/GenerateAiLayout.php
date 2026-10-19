<?php

declare(strict_types=1);

namespace App\Actions;

use App\Ai\AiSettings;
use App\Ai\Dto\LlmRequest;
use App\Ai\LlmProvider;
use App\Models\AiCall;
use App\Models\User;

/**
 * Asks the LLM to design the room layout (rooms as rectangles on a 910mm grid).
 * The browser validates the result with exact geometry rules and asks again with the issues.
 */
final class GenerateAiLayout
{
    public function __construct(
        private readonly LlmProvider $llmProvider,
    ) {
    }

    /**
     * @param  array<string, mixed>  $context
     * @param  list<string>  $issues
     * @param  array<string, mixed>|null  $previousLayout
     * @return array{layout: array<string, mixed>, source: string, degraded: bool, model: string, usage: array{inputTokens: int, outputTokens: int}, requestId: string}
     */
    public function handle(
        array $context,
        array $issues = [],
        ?array $previousLayout = null,
        ?User $user = null,
        string $requestId = '',
    ): array {
        $payload = $context;
        if ($issues !== [] && $previousLayout !== null) {
            $payload['issues'] = $issues;
            $payload['previousLayout'] = $previousLayout;
        }
        $userContent = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';

        $settings = app(AiSettings::class);
        $systemPrompt = $settings->getPrompt('layout', 'ja');
        $schemaFile = resource_path('ai/schemas/layout.schema.json');
        /** @var array<string, mixed> $schema */
        $schema = json_decode((string) file_get_contents($schemaFile), true) ?: [];

        $result = $this->llmProvider->generateJson(new LlmRequest(
            systemPrompt: $systemPrompt,
            userContent: $userContent,
            jsonSchema: $schema,
            temperature: 0.4,
            maxTokens: 12288,
            timeout: 90,
            thinkingBudget: $issues === [] ? 2048 : 1024,
        ));

        AiCall::create([
            'user_id' => $user?->id,
            'endpoint' => '/api/v1/ai/layout',
            'provider' => $result->provider,
            'model' => $result->model,
            'source' => $result->resolvedSource(),
            'degraded' => $result->degraded,
            'input_tokens' => $result->usage->inputTokens,
            'output_tokens' => $result->usage->outputTokens,
            'latency_ms' => $result->latencyMs,
            'status' => 200,
            'created_at' => now(),
        ]);

        return [
            'layout' => $result->data,
            'source' => $result->resolvedSource(),
            'degraded' => $result->degraded,
            'model' => $result->model,
            'usage' => $result->usage->toArray(),
            'requestId' => $requestId,
        ];
    }
}
