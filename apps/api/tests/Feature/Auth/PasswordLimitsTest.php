<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();
});

/**
 * @return array<string, mixed>
 */
function registrationPayload(string $email, string $password): array
{
    return [
        'name' => 'Limit Tester',
        'email' => $email,
        'password' => $password,
        'password_confirmation' => $password,
    ];
}

test('register accepts passwords up to 72 bytes and rejects longer ones (bcrypt ignores bytes past 72)', function (string $password, int $expectedStatus): void {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/v1/auth/register', registrationPayload('limit-'.md5($password).'@example.com', $password));

    $response->assertStatus($expectedStatus);
    if ($expectedStatus === 422) {
        $response->assertJsonPath('code', 'VALIDATION_FAILED');
        $response->assertJsonStructure(['errors' => ['password']]);
    }
})->with([
    '72 ascii bytes' => [str_repeat('a', 72), 201],
    '73 ascii bytes' => [str_repeat('a', 73), 422],
    '24 japanese chars = 72 bytes' => [str_repeat('あ', 24), 201],
    '25 japanese chars = 75 bytes' => [str_repeat('あ', 25), 422],
    '1 MB password' => [str_repeat('A', 1_000_000), 422],
]);

test('login rejects oversized email and password input before doing any hashing work', function (string $field): void {
    /** @var Tests\TestCase $this */
    $payload = ['email' => 'someone@example.com', 'password' => 'whatever-pass'];
    $payload[$field] = str_repeat('x', 256);

    $response = $this->postJson('/api/v1/auth/login', $payload);

    $response->assertStatus(422);
    $response->assertJsonStructure(['errors' => [$field]]);
})->with([['email'], ['password']]);
