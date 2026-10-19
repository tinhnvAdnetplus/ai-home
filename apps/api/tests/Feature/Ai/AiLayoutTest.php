<?php

declare(strict_types=1);

namespace Tests\Feature\Ai;

use App\Ai\Providers\GeminiProvider;
use App\Models\AiCall;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    /** @var TestCase $this */
    $this->withoutVite();
});

$context = [
    'variant' => ['id' => 'A', 'name' => '案A', 'focus' => '家事動線重視'],
    'lot' => ['frontageM' => 12, 'depthM' => 20, 'maxGridW' => 12, 'maxGridD' => 16],
    'floors' => 1,
    'targetTsubo' => 30,
];

test('layout endpoint rejects a request without context', function (): void {
    /** @var TestCase $this */
    $this->postJson('/api/v1/ai/layout', [])->assertStatus(422);
});

test('layout endpoint returns an empty degraded layout when the AI is unavailable (local provider)', function () use ($context): void {
    /** @var TestCase $this */
    config(['ai.provider' => 'local']);

    $response = $this->postJson('/api/v1/ai/layout', ['context' => $context]);

    $response->assertOk()
        ->assertJsonPath('layout.floors', [])
        ->assertJsonPath('layout.gridW', 0);
    expect(AiCall::query()->where('endpoint', '/api/v1/ai/layout')->count())->toBe(1);
});

test('layout schema is accepted by Gemini and the layout is returned with repair issues in the prompt', function () use ($context): void {
    /** @var TestCase $this */
    $layout = ['reasoning' => ['program' => 'p', 'zoning' => 'z', 'circulation' => 'c'], 'gridW' => 8, 'floors' => [['level' => 1, 'gridD' => 8, 'rooms' => []]]];
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => json_encode($layout)]]], 'finishReason' => 'STOP']],
            'usageMetadata' => ['promptTokenCount' => 10, 'candidatesTokenCount' => 5],
        ], 200),
    ]);
    $this->app->bind(\App\Ai\LlmProvider::class, fn () => new GeminiProvider('test-key', 'gemini-3.8-flash'));

    $response = $this->postJson('/api/v1/ai/layout', [
        'context' => $context,
        'issues' => ['1階 空きセルがあります'],
        'previousLayout' => $layout,
    ]);

    $response->assertOk()->assertJsonPath('layout.gridW', 8);
    Http::assertSent(function ($request): bool {
        $body = $request->data();
        $text = $body['contents'][0]['parts'][0]['text'] ?? '';

        return str_contains($text, 'previousLayout')
            && str_contains($text, '空きセル')
            && ($body['generationConfig']['thinkingConfig']['thinkingBudget'] ?? null) === 1024;
    });
});
