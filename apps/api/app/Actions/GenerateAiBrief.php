<?php

declare(strict_types=1);

namespace App\Actions;

use App\Ai\AiSettings;
use App\Ai\Dto\LlmRequest;
use App\Ai\LlmProvider;
use App\Models\AiCall;
use App\Models\User;

/**
 * Asks the LLM to review the customer's program against the lot facts the planner measured,
 * and to drop or shrink what cannot be built, with a reason for the customer.
 * The browser validates every change and re-measures; remaining issues come back here.
 */
final class GenerateAiBrief
{
    public function __construct(
        private readonly LlmProvider $llmProvider,
    ) {
    }

    /**
     * @param  array<string, mixed>  $context
     * @param  list<string>  $issues
     * @param  array<string, mixed>|null  $previousAnswer
     * @return array{brief: array<string, mixed>, source: string, degraded: bool, model: string, usage: array{inputTokens: int, outputTokens: int}, requestId: string}
     */
    public function handle(
        array $context,
        array $issues = [],
        ?array $previousAnswer = null,
        ?User $user = null,
        string $requestId = '',
    ): array {
        $payload = $context;
        if ($issues !== [] && $previousAnswer !== null) {
            $payload['remainingIssues'] = $issues;
            $payload['previousAnswer'] = $previousAnswer;
        }
        $userContent = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';

        $settings = app(AiSettings::class);
        $systemPrompt = $settings->getPrompt('brief', 'ja');
        $schemaFile = resource_path('ai/schemas/brief.schema.json');
        /** @var array<string, mixed> $schema */
        $schema = json_decode((string) file_get_contents($schemaFile), true) ?: [];

        $result = $this->llmProvider->generateJson(new LlmRequest(
            systemPrompt: $systemPrompt,
            userContent: $userContent,
            jsonSchema: $schema,
            temperature: 0.3,
            maxTokens: 8192,
            timeout: 60,
            thinkingBudget: 2048,
        ));

        AiCall::create([
            'user_id' => $user?->id,
            'endpoint' => '/api/v1/ai/brief',
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
            'brief' => $result->data,
            'source' => $result->resolvedSource(),
            'degraded' => $result->degraded,
            'model' => $result->model,
            'usage' => $result->usage->toArray(),
            'requestId' => $requestId,
        ];
    }
}
