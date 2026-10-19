<?php

declare(strict_types=1);

namespace App\Actions;

use App\Ai\AiSettings;
use App\Ai\Dto\LlmRequest;
use App\Ai\LlmProvider;
use App\Ai\Schema\ConstraintsValidator;
use App\Ai\Schema\DesignConstraints;

final class TestAiPrompt
{
    public function __construct(
        private readonly LlmProvider $llmProvider,
        private readonly AiSettings $aiSettings,
    ) {
    }

    /**
     * @param array<string, mixed> $answers
     * @return array{
     *     output: array<string, mixed>,
     *     valid: bool,
     *     issues: list<string>,
     *     usage: array{inputTokens: int, outputTokens: int},
     *     latencyMs: int,
     *     source: string
     * }
     */
    public function handle(string $which, ?string $prompt, array $answers): array
    {
        if ($which === 'constraints') {
            return $this->testConstraints($prompt, $answers);
        }

        return $this->testCommentary($prompt, $answers);
    }

    /**
     * @param array<string, mixed> $answers
     * @return array{output: array<string, mixed>, valid: bool, issues: list<string>, usage: array{inputTokens: int, outputTokens: int}, latencyMs: int, source: string}
     */
    private function testConstraints(?string $prompt, array $answers): array
    {
        $formatted = $this->buildCompactAnswers($answers);
        $tmpl = is_string($prompt) && trim($prompt) !== '' ? $prompt : $this->aiSettings->getPrompt('constraints', 'ja');
        $system = $this->aiSettings->renderPrompt($tmpl, $formatted, 'ja');
        $user = str_contains($tmpl, '{{answers}}') ? 'Please output the DesignConstraints JSON based on provided answers.' : $formatted;

        $req = new LlmRequest(
            systemPrompt: $system,
            userContent: $user,
            jsonSchema: DesignConstraints::schema(),
            temperature: $this->aiSettings->getTemperature(),
            maxTokens: $this->aiSettings->getMaxTokens(),
            timeout: $this->aiSettings->getTimeoutSeconds(),
        );

        $res = $this->llmProvider->generateJson($req);
        $raw = $res->data;
        $issues = [];
        if (! isset($raw['schemaVersion'])) {
            $issues[] = 'Missing schemaVersion';
        }
        if (! isset($raw['summary']) || ! is_string($raw['summary'])) {
            $issues[] = 'Missing or non-string summary';
        }
        if (! isset($raw['priorities']) || ! is_array($raw['priorities'])) {
            $issues[] = 'Missing priorities object';
        }

        return [
            'output' => ConstraintsValidator::validateAndSanitize($raw),
            'valid' => empty($issues),
            'issues' => $issues,
            'usage' => $res->usage->toArray(),
            'latencyMs' => $res->latencyMs,
            'source' => $res->resolvedSource(),
        ];
    }

    /**
     * @param array<string, mixed> $answers
     * @return array{output: array<string, mixed>, valid: bool, issues: list<string>, usage: array{inputTokens: int, outputTokens: int}, latencyMs: int, source: string}
     */
    private function testCommentary(?string $prompt, array $answers): array
    {
        $payload = ['answers' => $answers];
        $formatted = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?: '';
        $tmpl = is_string($prompt) && trim($prompt) !== '' ? $prompt : $this->aiSettings->getPrompt('commentary', 'ja');
        $system = $this->aiSettings->renderPrompt($tmpl, $formatted, 'ja');
        $user = str_contains($tmpl, '{{answers}}') ? 'Please output commentary JSON.' : $formatted;

        $schema = [
            'type' => 'object',
            'required' => ['items', 'recommendedLabel'],
            'properties' => [
                'items' => ['type' => 'array'],
                'recommendedLabel' => ['type' => 'string'],
            ],
        ];

        $req = new LlmRequest(
            systemPrompt: $system,
            userContent: $user,
            jsonSchema: $schema,
            temperature: $this->aiSettings->getTemperature(),
            maxTokens: $this->aiSettings->getMaxTokens(),
            timeout: $this->aiSettings->getTimeoutSeconds(),
        );

        $res = $this->llmProvider->generateJson($req);
        $raw = $res->data;
        $issues = [];
        if (! isset($raw['items']) || ! is_array($raw['items']) || empty($raw['items'])) {
            $issues[] = 'Missing or empty items array';
        }
        if (! isset($raw['recommendedLabel'])) {
            $issues[] = 'Missing recommendedLabel';
        }

        return [
            'output' => $raw,
            'valid' => empty($issues),
            'issues' => $issues,
            'usage' => $res->usage->toArray(),
            'latencyMs' => $res->latencyMs,
            'source' => $res->resolvedSource(),
        ];
    }

    /**
     * @param array<string, mixed> $answers
     */
    private function buildCompactAnswers(array $answers): string
    {
        $lines = ["# 施主アンケート回答（Wizard Answers）\n"];
        foreach ($answers as $k => $v) {
            $valStr = is_scalar($v) ? (string) $v : json_encode($v, JSON_UNESCAPED_UNICODE);
            if (str_contains($k, 'notes') || (is_string($v) && mb_strlen($v, 'UTF-8') > 40)) {
                $lines[] = "[要望: {$k}]\n=== UNTRUSTED USER INPUT START ===\n{$valStr}\n=== UNTRUSTED USER INPUT END ===";
            } else {
                $lines[] = "- {$k}: {$valStr}";
            }
        }

        return implode("\n", $lines);
    }
}
