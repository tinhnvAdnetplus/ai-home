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
    'lot' => ['frontageM' => 12, 'depthM' => 12, 'roadSide' => '南'],
    'program' => ['floors' => 2, 'cars' => 2, 'kidsRooms' => 2],
    'feasibility' => [
        'isFeasible' => false,
        'excessNow' => 0.9,
        'issues' => [['code' => 'HOUSE_EXCEEDS_LOT', 'message' => '奥行方向0.9mはみ出します']],
        'whatIf' => [['action' => 'set', 'field' => 'cars', 'value' => '1', 'from' => '2', 'excessAfter' => 0, 'isFitAlone' => true]],
    ],
    'allowedChanges' => ['numeric' => ['cars' => ['min' => 0, 'max' => 4]]],
];

test('brief endpoint rejects a request without the feasibility facts', function () use ($context): void {
    /** @var TestCase $this */
    $this->postJson('/api/v1/ai/brief', [])->assertStatus(422);
    $partial = $context;
    unset($partial['feasibility']);
    $this->postJson('/api/v1/ai/brief', ['context' => $partial])->assertStatus(422);
});

test('brief endpoint answers and logs the call when the AI is unavailable (local provider)', function () use ($context): void {
    /** @var TestCase $this */
    config(['ai.provider' => 'local']);

    $this->postJson('/api/v1/ai/brief', ['context' => $context])->assertOk();
    expect(AiCall::query()->where('endpoint', '/api/v1/ai/brief')->count())->toBe(1);
});

test('brief is returned from Gemini and the remaining issues reach the prompt', function () use ($context): void {
    /** @var TestCase $this */
    $brief = [
        'summary' => '駐車を1台にしました。',
        'reasoning' => 'whatIf で単独で収まるのは駐車1台案のみ',
        'adjustments' => [['action' => 'set', 'field' => 'cars', 'value' => '1', 'wish' => '駐車2台', 'reason' => '奥行が不足するため']],
        'suggestions' => [],
        'questions' => [],
        'isResolved' => true,
    ];
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => json_encode($brief)]]], 'finishReason' => 'STOP']],
            'usageMetadata' => ['promptTokenCount' => 10, 'candidatesTokenCount' => 5],
        ], 200),
    ]);
    $this->app->bind(\App\Ai\LlmProvider::class, fn () => new GeminiProvider('test-key', 'gemini-3.8-flash'));

    $response = $this->postJson('/api/v1/ai/brief', [
        'context' => $context,
        'issues' => ['奥行方向0.3mはみ出します'],
        'previousAnswer' => $brief,
    ]);

    $response->assertOk()
        ->assertJsonPath('brief.adjustments.0.field', 'cars')
        ->assertJsonPath('degraded', false);
    Http::assertSent(function ($request): bool {
        $body = $request->data();
        $text = $body['contents'][0]['parts'][0]['text'] ?? '';
        $system = json_encode($body['systemInstruction'] ?? $body['system_instruction'] ?? []) ?: '';

        return str_contains($text, 'remainingIssues')
            && str_contains($text, 'previousAnswer')
            && str_contains($text, 'whatIf')
            && str_contains($system, 'whatIf');
    });
});
