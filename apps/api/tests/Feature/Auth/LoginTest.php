<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\User;
use App\Support\ApiErrorCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();
});

test('successful login sets session, regenerates session id, and enables /me access', function (): void {
    /** @var Tests\TestCase $this */
    $user = User::factory()->create([
        'email' => 'login-success@example.com',
        'password' => Hash::make('Password1234!'),
        'role' => Role::USER,
    ]);

    // Start session
    $this->get('/sanctum/csrf-cookie');
    $initialSessionId = session()->getId();

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'login-success@example.com',
        'password' => 'Password1234!',
    ]);

    $response->assertStatus(200);
    $response->assertHeader('X-Request-Id');
    $response->assertJsonPath('data.id', $user->id);
    $response->assertJsonPath('data.email', 'login-success@example.com');
    $response->assertJsonPath('data.role', 'user');

    $newSessionId = session()->getId();
    expect($newSessionId)->not()->toBe($initialSessionId);

    // Call /me with existing session
    $meResponse = $this->getJson('/api/v1/auth/me');
    $meResponse->assertStatus(200);
    $meResponse->assertJsonPath('data.id', $user->id);
    $meResponse->assertJsonPath('data.email', 'login-success@example.com');
});

test('wrong password and unknown email produce IDENTICAL status and body except request_id', function (): void {
    /** @var Tests\TestCase $this */
    User::factory()->create([
        'email' => 'existing-user@example.com',
        'password' => Hash::make('CorrectPassword1234!'),
    ]);

    // Attempt 1: Unknown email
    $resUnknownEmail = $this->postJson('/api/v1/auth/login', [
        'email' => 'nonexistent-user-12345@example.com',
        'password' => 'SomePassword1234!',
    ]);

    // Attempt 2: Known email with wrong password
    $resWrongPassword = $this->postJson('/api/v1/auth/login', [
        'email' => 'existing-user@example.com',
        'password' => 'DefinitelyWrongPassword!',
    ]);

    $resUnknownEmail->assertStatus(401);
    $resWrongPassword->assertStatus(401);

    expect($resUnknownEmail->headers->get('Content-Type'))->toContain('application/problem+json')
        ->and($resWrongPassword->headers->get('Content-Type'))->toContain('application/problem+json');

    /** @var array<string, mixed> $bodyUnknown */
    $bodyUnknown = $resUnknownEmail->json();
    /** @var array<string, mixed> $bodyWrongPw */
    $bodyWrongPw = $resWrongPassword->json();

    expect($bodyUnknown['code'])->toBe(ApiErrorCode::UNAUTHENTICATED->value)
        ->and($bodyWrongPw['code'])->toBe(ApiErrorCode::UNAUTHENTICATED->value)
        ->and($bodyUnknown['title'])->toBe('Unauthenticated')
        ->and($bodyWrongPw['title'])->toBe('Unauthenticated')
        ->and($bodyUnknown['detail'])->toBe('Unauthenticated.')
        ->and($bodyWrongPw['detail'])->toBe('Unauthenticated.')
        ->and($bodyUnknown['status'])->toBe(401)
        ->and($bodyWrongPw['status'])->toBe(401);

    // Strip request_id and verify payloads are identical byte-for-byte
    unset($bodyUnknown['request_id']);
    unset($bodyWrongPw['request_id']);
    expect($bodyUnknown)->toEqual($bodyWrongPw);
});

test('throttles after 5 failed login attempts per email and IP with 429 problem response', function (): void {
    /** @var Tests\TestCase $this */
    $ip = '192.168.100.5';
    $targetEmail = 'target@example.com';
    $otherEmail = 'different@example.com';

    RateLimiter::clear(Str::transliterate($targetEmail.'|'.$ip));
    RateLimiter::clear(Str::transliterate($otherEmail.'|'.$ip));

    for ($i = 1; $i <= 5; $i++) {
        $res = $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/auth/login', [
            'email' => $targetEmail,
            'password' => 'WrongPass!',
        ]);
        $res->assertStatus(401);
    }

    // 6th failed attempt triggers 429
    $res6 = $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/auth/login', [
        'email' => $targetEmail,
        'password' => 'WrongPass!',
    ]);
    $res6->assertStatus(429);
    $res6->assertHeader('Content-Type', 'application/problem+json');
    $res6->assertHeader('Retry-After');
    $res6->assertJsonPath('code', ApiErrorCode::TOO_MANY_REQUESTS->value);
    $res6->assertJsonPath('status', 429);

    // Different email from same IP is NOT throttled
    $resOther = $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/auth/login', [
        'email' => $otherEmail,
        'password' => 'WrongPass!',
    ]);
    $resOther->assertStatus(401);
});

test('successful login is not throttled and clears prior failure count', function (): void {
    /** @var Tests\TestCase $this */
    $ip = '192.168.100.6';
    $email = 'gooduser@example.com';
    $password = 'CorrectPassword1234!';

    User::factory()->create([
        'email' => $email,
        'password' => Hash::make($password),
    ]);

    RateLimiter::clear(Str::transliterate($email.'|'.$ip));

    // 4 failed attempts
    for ($i = 1; $i <= 4; $i++) {
        $res = $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => 'BadPass!',
        ]);
        $res->assertStatus(401);
    }

    // Successful attempt -> 200, clears throttle
    $resSuccess = $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/auth/login', [
        'email' => $email,
        'password' => $password,
    ]);
    $resSuccess->assertStatus(200);

    // Further logins succeed without throttle
    for ($i = 1; $i <= 6; $i++) {
        $resRepeat = $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => $password,
        ]);
        $resRepeat->assertStatus(200);
    }
});
