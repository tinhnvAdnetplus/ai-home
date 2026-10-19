<?php

declare(strict_types=1);

namespace App\Actions;

use App\Ai\Dto\LlmRequest;
use App\Ai\LlmProvider;
use App\Models\AiCall;
use App\Models\User;

final class GeneratePlanCommentary
{
    public function __construct(
        private readonly LlmProvider $llmProvider,
    ) {
    }

    /**
     * @param  array<string, mixed>  $answers
     * @param  array<string, mixed>  $constraints
     * @param  list<array<string, mixed>>  $plans
     * @return array{
     *     items: list<array{label: string, headline: string, body: string, pros: list<string>, cautions: list<string>}>,
     *     recommendedLabel: string,
     *     source: string,
     *     degraded: bool,
     *     model: string,
     *     usage: array{inputTokens: int, outputTokens: int},
     *     requestId: string
     * }
     */
    public function handle(
        array $answers,
        array $constraints,
        array $plans,
        ?User $user = null,
        string $requestId = '',
    ): array {
        $userPayload = [
            'answers' => $answers,
            'constraints' => $constraints,
            'plans' => $plans,
        ];
        $userPrompt = json_encode($userPayload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?: '';

        $aiSettings = app(\App\Ai\AiSettings::class);
        $template = $aiSettings->getPrompt('commentary', 'ja');
        $renderedPrompt = $aiSettings->renderPrompt($template, $userPrompt, 'ja');
        $containsAnswers = str_contains($template, '{{answers}}');
        $systemPrompt = $renderedPrompt;
        $userContent = $containsAnswers ? 'Please output the plan commentary JSON based on the provided plans and answers.' : $userPrompt;

        $schema = [
            'type' => 'object',
            'required' => ['items', 'recommendedLabel'],
            'properties' => [
                'items' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'required' => ['label', 'headline', 'body', 'pros', 'cautions'],
                        'properties' => [
                            'label' => ['type' => 'string'],
                            'headline' => ['type' => 'string', 'maxLength' => 40],
                            'body' => ['type' => 'string', 'maxLength' => 300],
                            'pros' => [
                                'type' => 'array',
                                'maxItems' => 3,
                                'items' => ['type' => 'string', 'maxLength' => 50],
                            ],
                            'cautions' => [
                                'type' => 'array',
                                'maxItems' => 3,
                                'items' => ['type' => 'string', 'maxLength' => 50],
                            ],
                        ],
                    ],
                ],
                'recommendedLabel' => ['type' => 'string'],
            ],
        ];

        $request = new LlmRequest(
            systemPrompt: $systemPrompt,
            userContent: $userContent,
            jsonSchema: $schema,
            temperature: $aiSettings->getTemperature(),
            maxTokens: $aiSettings->getMaxTokens(),
            timeout: $aiSettings->getTimeoutSeconds(),
        );

        $result = $this->llmProvider->generateJson($request);

        $validated = $this->validateCommentary($result->data, $plans);

        // Record call in ai_calls table
        AiCall::create([
            'user_id' => $user?->id,
            'endpoint' => '/api/v1/ai/commentary',
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
            'items' => $validated['items'],
            'recommendedLabel' => $validated['recommendedLabel'],
            'source' => $result->resolvedSource(),
            'degraded' => $result->degraded,
            'model' => $result->model,
            'usage' => $result->usage->toArray(),
            'requestId' => $requestId,
        ];
    }

    /**
     * @param  array<string, mixed>  $raw
     * @param  list<array<string, mixed>>  $plans
     * @return array{items: list<array{label: string, headline: string, body: string, pros: list<string>, cautions: list<string>}>, recommendedLabel: string}
     */
    private function validateCommentary(array $raw, array $plans): array
    {
        $rawItems = isset($raw['items']) && is_array($raw['items']) ? $raw['items'] : [];
        $items = [];

        foreach ($rawItems as $idx => $item) {
            if (! is_array($item)) {
                continue;
            }
            $fallbackLabel = isset($plans[$idx]['label']) && is_string($plans[$idx]['label']) ? $plans[$idx]['label'] : (string) ($idx + 1);
            $label = isset($item['label']) && is_string($item['label']) ? $item['label'] : $fallbackLabel;
            $headline = isset($item['headline']) && is_string($item['headline']) ? $item['headline'] : 'おすすめプランのご提案';
            $body = isset($item['body']) && is_string($item['body']) ? $item['body'] : 'ご要望と敷地条件を考慮したプランニングです。';

            $pros = [];
            if (isset($item['pros']) && is_array($item['pros'])) {
                foreach ($item['pros'] as $pro) {
                    if (is_string($pro) && count($pros) < 3) {
                        $pros[] = mb_substr(trim($pro), 0, 50, 'UTF-8');
                    }
                }
            }

            $cautions = [];
            if (isset($item['cautions']) && is_array($item['cautions'])) {
                foreach ($item['cautions'] as $caution) {
                    if (is_string($caution) && count($cautions) < 3) {
                        $cautions[] = mb_substr(trim($caution), 0, 50, 'UTF-8');
                    }
                }
            }

            $items[] = [
                'label' => mb_substr($label, 0, 10, 'UTF-8'),
                'headline' => mb_substr($headline, 0, 40, 'UTF-8'),
                'body' => mb_substr($body, 0, 300, 'UTF-8'),
                'pros' => $pros,
                'cautions' => $cautions,
            ];
        }

        $recommendedLabel = isset($raw['recommendedLabel']) && is_string($raw['recommendedLabel'])
            ? mb_substr(trim($raw['recommendedLabel']), 0, 10, 'UTF-8')
            : (isset($items[0]['label']) ? $items[0]['label'] : 'A');

        return [
            'items' => $items,
            'recommendedLabel' => $recommendedLabel,
        ];
    }
}
