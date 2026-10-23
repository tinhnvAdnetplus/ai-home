<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\User;
use App\Support\Ability;
use App\Support\ApiErrorCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();
    config(['sanctum.stateful' => ['localhost']]);
});

test('me without login returns 401 problem+json', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->getJson('/api/v1/auth/me');

    $response->assertStatus(401);
    expect($response->headers->get('Content-Type'))->toContain('application/problem+json');
    $response->assertJsonPath('code', ApiErrorCode::UNAUTHENTICATED->value);
    $response->assertJsonPath('title', 'Unauthenticated');
    $response->assertJsonPath('detail', 'Unauthenticated.');
    expect($response->json('request_id'))->toBeString();
});

test('me with authenticated user returns id, name, email, role, and abilities but never password', function (): void {
    /** @var Tests\TestCase $this */
    $admin = User::factory()->create([
        'name' => 'Admin Boss',
        'email' => 'admin@example.com',
        'role' => Role::ADMIN,
        'password' => Hash::make('Password1234!'),
    ]);

    $response = $this->actingAs($admin)->getJson('/api/v1/auth/me');

    $response->assertStatus(200);
    $response->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body)->toHaveKey('data')
        ->and($body['data']['id'])->toBe($admin->id)
        ->and($body['data']['name'])->toBe('Admin Boss')
        ->and($body['data']['email'])->toBe('admin@example.com')
        ->and($body['data']['role'])->toBe('admin')
        ->and($body['data']['abilities'])->toEqualCanonicalizing([
            Ability::MANAGE_CONFIG,
            Ability::MANAGE_USERS,
            Ability::REVIEW_PLANS,
            Ability::OWN_PLANS,
        ])
        ->and($body['data'])->not->toHaveKey('password')
        ->and($body['data'])->not->toHaveKey('remember_token');
});

test('logout invalidates session, regenerates csrf token, and subsequent me returns 401', function (): void {
    /** @var Tests\TestCase $this */
    $statefulHeaders = [
        'Origin' => 'http://localhost',
        'Referer' => 'http://localhost/',
    ];

    $user = User::factory()->create([
        'email' => 'session-test@example.com',
        'password' => Hash::make('Password1234!'),
        'role' => Role::USER,
    ]);

    // Initialize session and CSRF cookie
    $this->withHeaders($statefulHeaders)->get('/sanctum/csrf-cookie');
    $tokenBefore = session()->token();

    // Log in via stateful HTTP request
    $loginRes = $this->withHeaders(array_merge($statefulHeaders, [
        'X-CSRF-TOKEN' => $tokenBefore,
    ]))->postJson('/api/v1/auth/login', [
        'email' => 'session-test@example.com',
        'password' => 'Password1234!',
    ]);
    $loginRes->assertStatus(200);

    // Verify /me works
    $meBefore = $this->withHeaders($statefulHeaders)->getJson('/api/v1/auth/me');
    $meBefore->assertStatus(200);
    $meBefore->assertJsonPath('data.email', 'session-test@example.com');

    // Call logout with stateful headers
    $logoutRes = $this->withHeaders(array_merge($statefulHeaders, [
        'X-CSRF-TOKEN' => session()->token(),
    ]))->postJson('/api/v1/auth/logout');
    $logoutRes->assertStatus(200);
    $logoutRes->assertJsonPath('message', 'Logged out successfully');

    $tokenAfter = session()->token();
    expect($tokenAfter)->not()->toBe($tokenBefore);

    // Verify /me now fails with 401
    $meAfter = $this->withHeaders($statefulHeaders)->getJson('/api/v1/auth/me');
    $meAfter->assertStatus(401);
    $meAfter->assertJsonPath('code', ApiErrorCode::UNAUTHENTICATED->value);
});

test('session without login returns 200 with null data', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->getJson('/api/v1/auth/session');

    $response->assertStatus(200);
    $response->assertExactJson(['data' => null]);
});

test('session with authenticated user returns the same body as me', function (): void {
    /** @var Tests\TestCase $this */
    $user = User::factory()->create([
        'email' => 'session-probe@example.com',
        'role' => Role::USER,
    ]);

    $me = $this->actingAs($user)->getJson('/api/v1/auth/me');
    $session = $this->actingAs($user)->getJson('/api/v1/auth/session');

    $session->assertStatus(200);
    $session->assertJsonPath('data.email', 'session-probe@example.com');
    expect($session->json())->toBe($me->json());
});
