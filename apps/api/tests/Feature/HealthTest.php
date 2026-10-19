<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;

/** @var Tests\TestCase $this */

test('health endpoint returns 200 with status ok, db up, and ISO-8601 UTC time', function () {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    $response = $this->getJson('/api/v1/health');

    $response->assertStatus(200);

    /** @var array<string, mixed> $data */
    $data = $response->json();

    expect(array_keys($data))->toEqualCanonicalizing(['status', 'db', 'time'])
        ->and($data['status'])->toBe('ok')
        ->and($data['db'])->toBe('up')
        ->and($data['time'])->toBeString();

    $time = (string) $data['time'];
    $parsed = DateTimeImmutable::createFromFormat("Y-m-d\TH:i:s\Z", $time);

    expect($parsed)->not->toBeFalse();
    assert($parsed instanceof DateTimeImmutable);
    expect($parsed->format("Y-m-d\TH:i:s\Z"))->toBe($time);
});

test('health endpoint returns 200 with db down when database query throws', function () {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    DB::shouldReceive('select')
        ->once()
        ->with('SELECT 1')
        ->andThrow(new RuntimeException('Database connection failed'));

    $response = $this->getJson('/api/v1/health');

    $response->assertStatus(200);

    /** @var array<string, mixed> $data */
    $data = $response->json();

    expect(array_keys($data))->toEqualCanonicalizing(['status', 'db', 'time'])
        ->and($data['status'])->toBe('ok')
        ->and($data['db'])->toBe('down')
        ->and($data['time'])->toBeString();
});
