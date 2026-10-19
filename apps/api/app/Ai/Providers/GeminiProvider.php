<?php

declare(strict_types=1);

namespace App\Ai\Providers;

use App\Ai\Dto\LlmRequest;
use App\Ai\Dto\LlmResult;
use App\Ai\Dto\LlmUsage;
use App\Ai\LlmProvider;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

final class GeminiProvider implements LlmProvider
{
    public function __construct(
        private readonly ?string $apiKey = null,
        private readonly string $model = 'gemini-3.8-flash',
        private readonly string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta',
    ) {
    }

    public function generateJson(LlmRequest $req): LlmResult
    {
        if ($this->apiKey === null || trim($this->apiKey) === '') {
            throw new RuntimeException('Gemini API key is not configured.');
        }

        $startTime = hrtime(true);
        $url = rtrim($this->baseUrl, '/')."/models/{$this->model}:generateContent";

        $payload = [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $req->userContent],
                    ],
                ],
            ],
            'systemInstruction' => [
                'parts' => [
                    ['text' => $req->systemPrompt],
                ],
            ],
            'generationConfig' => [
                'temperature' => $req->temperature,
                'maxOutputTokens' => max(4096, $req->maxTokens),
                'responseMimeType' => 'application/json',
                'responseJsonSchema' => $req->jsonSchema,
            ],
        ];

        if ($req->thinkingBudget !== null) {
            $payload['generationConfig']['thinkingConfig'] = ['thinkingBudget' => $req->thinkingBudget];
        }

        // Gemini occasionally degenerates into runaway output (finish=MAX_TOKENS, truncated JSON):
        // retry once with temperature 0 before giving up (the caller then falls back to local).
        try {
            [$data, $response] = $this->callOnce($url, $payload, $req->timeout);
        } catch (InvalidGeminiJsonException) {
            $payload['generationConfig']['temperature'] = 0;
            [$data, $response] = $this->callOnce($url, $payload, $req->timeout);
        }

        $latencyMs = (int) round((hrtime(true) - $startTime) / 1e6);
        $inTokens = (int) ($response->json('usageMetadata.promptTokenCount') ?? 0);
        $outTokens = (int) ($response->json('usageMetadata.candidatesTokenCount') ?? 0);

        return new LlmResult(
            data: $data,
            usage: new LlmUsage($inTokens, $outTokens),
            latencyMs: max(1, $latencyMs),
            provider: 'gemini',
            model: $this->model,
            source: 'gemini',
            degraded: false,
        );
    }
    /**
     * @param  array<string, mixed>  $payload
     * @return array{0: array<string, mixed>, 1: Response}
     */
    private function callOnce(string $url, array $payload, int $timeout): array
    {
        try {
            $response = Http::withHeaders(['x-goog-api-key' => $this->apiKey])
                ->timeout($timeout)
                ->retry(2, 100, function (Throwable $e): bool {
                    if ($e instanceof RequestException && $e->response !== null) {
                        return in_array($e->response->status(), [429, 500, 502, 503, 504], true);
                    }

                    return false;
                }, throw: false)
                ->post($url, $payload);
        } catch (Throwable $e) {
            throw new RuntimeException('Gemini network request failed: '.$e->getMessage(), 0, $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException("Gemini API call failed with status: {$response->status()}");
        }

        $rawText = $response->json('candidates.0.content.parts.0.text');
        $decoded = is_string($rawText) && trim($rawText) !== '' ? json_decode($rawText, true) : null;
        if (! is_array($decoded)) {
            throw new InvalidGeminiJsonException('Failed to decode valid JSON from Gemini output (finish='.(string) $response->json('candidates.0.finishReason').', len='.strlen((string) $rawText).').');
        }

        /** @var array<string, mixed> $decoded */
        return [$decoded, $response];
    }
}
