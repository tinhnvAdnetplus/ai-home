<?php

declare(strict_types=1);

use App\Support\ApiErrorCode;
use Illuminate\Support\Facades\Route;

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    Route::middleware('api')->prefix('api/test')->group(function (): void {
        Route::get('http-error/{status}', function (int $status): never {
            abort($status);
        });
    });
});

test('unmapped 4xx http exceptions use the CLIENT_ERROR code, not SERVER_ERROR', function (int $status): void {
    /** @var Tests\TestCase $this */
    $response = $this->getJson("/api/test/http-error/{$status}");

    $response->assertStatus($status);
    expect($response->headers->get('Content-Type'))->toContain('application/problem+json');
    $response->assertJsonPath('code', ApiErrorCode::CLIENT_ERROR->value);
    $response->assertJsonPath('status', $status);
    expect($response->json('request_id'))->toBeString();
})->with([[400], [409], [415]]);

test('419 http exception maps to CSRF_MISMATCH', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->getJson('/api/test/http-error/419');

    $response->assertStatus(419);
    expect($response->headers->get('Content-Type'))->toContain('application/problem+json');
    $response->assertJsonPath('code', ApiErrorCode::CSRF_MISMATCH->value);
    $response->assertJsonPath('status', 419);
    expect($response->json('request_id'))->toBeString();
    expect($response->json('request_id'))->not()->toBe('');
});

test('unmapped 5xx http exceptions keep the SERVER_ERROR code', function (int $status): void {
    /** @var Tests\TestCase $this */
    $response = $this->getJson("/api/test/http-error/{$status}");

    $response->assertStatus($status);
    $response->assertJsonPath('code', ApiErrorCode::SERVER_ERROR->value);
})->with([[500], [502], [503]]);
