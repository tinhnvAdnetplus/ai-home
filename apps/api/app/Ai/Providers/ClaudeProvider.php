<?php

declare(strict_types=1);

namespace App\Ai\Providers;

use App\Ai\Dto\LlmRequest;
use App\Ai\Dto\LlmResult;
use App\Ai\Dto\LlmUsage;
use App\Ai\LlmProvider;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

final class ClaudeProvider implements LlmProvider
{
    public function __construct(
        private readonly ?string $apiKey = null,
        private readonly string $model = 'claude-3-5-haiku-20241022',
        private readonly string $baseUrl = 'https://api.anthropic.com/v1',
    ) {
    }

    public function generateJson(LlmRequest $req): LlmResult
    {
        if ($this->apiKey === null || trim($this->apiKey) === '') {
            throw new RuntimeException('Anthropic API key is not configured.');
        }

        $startTime = hrtime(true);
        $url = rtrim($this->baseUrl, '/').'/messages';

        $toolName = 'structured_output';
        $payload = [
            'model' => $this->model,
            'max_tokens' => $req->maxTokens,
            'temperature' => $req->temperature,
            'system' => $req->systemPrompt,
            'messages' => [
                ['role' => 'user', 'content' => $req->userContent],
            ],
            'tools' => [
                [
                    'name' => $toolName,
                    'description' => 'Return structured data matching the specified JSON schema',
                    'input_schema' => $req->jsonSchema,
                ],
            ],
            'tool_choice' => [
                'type' => 'tool',
                'name' => $toolName,
            ],
        ];

        try {
            $response = Http::timeout($req->timeout)
                ->withHeaders([
                    'x-api-key' => $this->apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type' => 'application/json',
                ])
                ->retry(2, 100, function (Throwable $e): bool {
                    if ($e instanceof RequestException && $e->response !== null) {
                        return in_array($e->response->status(), [429, 500, 502, 503, 504], true);
                    }

                    return false;
                }, throw: false)
                ->post($url, $payload);
        } catch (Throwable $e) {
            throw new RuntimeException('Anthropic network request failed: '.$e->getMessage(), 0, $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException("Anthropic API call failed with status: {$response->status()}");
        }

        /** @var list<array<string, mixed>>|null $contentBlocks */
        $contentBlocks = $response->json('content');
        if (! is_array($contentBlocks)) {
            throw new RuntimeException('Anthropic returned unexpected empty content.');
        }

        $toolInput = null;
        foreach ($contentBlocks as $block) {
            if (($block['type'] ?? '') === 'tool_use' && ($block['name'] ?? '') === $toolName) {
                $toolInput = $block['input'] ?? null;
                break;
            }
        }

        if ($toolInput === null) {
            throw new RuntimeException('Anthropic did not return the requested structured tool output.');
        }

        $data = is_array($toolInput) ? $toolInput : json_decode((string) $toolInput, true);
        if (! is_array($data) || empty($data)) {
            throw new RuntimeException('Failed to extract valid JSON data from Anthropic tool call.');
        }

        $latencyMs = (int) round((hrtime(true) - $startTime) / 1e6);
        $inTokens = (int) ($response->json('usage.input_tokens') ?? 0);
        $outTokens = (int) ($response->json('usage.output_tokens') ?? 0);

        return new LlmResult(
            data: $data,
            usage: new LlmUsage($inTokens, $outTokens),
            latencyMs: max(1, $latencyMs),
            provider: 'claude',
            model: $this->model,
            source: 'claude',
            degraded: false,
        );
    }
}
