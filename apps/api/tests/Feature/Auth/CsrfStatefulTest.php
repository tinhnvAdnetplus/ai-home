<?php

declare(strict_types=1);

use App\Models\User;
use App\Support\ApiErrorCode;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();
    config(['sanctum.stateful' => ['localhost']]);

    // Laravel skips CSRF verification whenever the environment is "testing" (runningUnitTests). These tests exist to prove that
    // verification is ON for the stateful SPA flow, so present a non-testing environment to the CSRF middleware.
    $this->app->detectEnvironment(static fn (): string => 'local');
});

test('login, logout, and register from stateful origin without CSRF token return 419 CSRF_MISMATCH problem response', function (): void {
    /** @var Tests\TestCase $this */
    $statefulHeaders = [
        'Origin' => 'http://localhost',
        'Referer' => 'http://localhost/',
    ];

    // 1. Register without CSRF
    $resRegister = $this->withHeaders($statefulHeaders)->postJson('/api/v1/auth/register', [
        'name' => 'Stateful User',
        'email' => 'stateful@example.com',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);
    $resRegister->assertStatus(419);
    expect($resRegister->headers->get('Content-Type'))->toContain('application/problem+json');
    $resRegister->assertJsonPath('code', ApiErrorCode::CSRF_MISMATCH->value);
    $resRegister->assertJsonPath('status', 419);

    // 2. Login without CSRF
    $resLogin = $this->withHeaders($statefulHeaders)->postJson('/api/v1/auth/login', [
        'email' => 'stateful@example.com',
        'password' => 'Password1234!',
    ]);
    $resLogin->assertStatus(419);
    expect($resLogin->headers->get('Content-Type'))->toContain('application/problem+json');
    $resLogin->assertJsonPath('code', ApiErrorCode::CSRF_MISMATCH->value);

    // 3. Logout without CSRF
    $resLogout = $this->withHeaders($statefulHeaders)->postJson('/api/v1/auth/logout');
    $resLogout->assertStatus(419);
    expect($resLogout->headers->get('Content-Type'))->toContain('application/problem+json');
    $resLogout->assertJsonPath('code', ApiErrorCode::CSRF_MISMATCH->value);
});

test('full stateful cookie authentication flow works seamlessly with CSRF tokens', function (): void {
    /** @var Tests\TestCase $this */
    $statefulOrigin = [
        'Origin' => 'http://localhost',
        'Referer' => 'http://localhost/',
    ];

    // 1. Fetch CSRF cookie to initialize session & CSRF token
    $csrfRes = $this->withHeaders($statefulOrigin)->get('/sanctum/csrf-cookie');
    $csrfRes->assertSuccessful();

    $sessionToken = session()->token();
    expect($sessionToken)->toBeString()
        ->and($sessionToken)->not()->toBe('');

    $authenticatedHeaders = array_merge($statefulOrigin, [
        'X-CSRF-TOKEN' => $sessionToken,
    ]);

    // 2. Register user via stateful request with CSRF token
    $regResponse = $this->withHeaders($authenticatedHeaders)->postJson('/api/v1/auth/register', [
        'name' => 'Stateful Client',
        'email' => 'client@aihome.local',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);
    $regResponse->assertStatus(201);
    $regResponse->assertJsonPath('data.email', 'client@aihome.local');
    $regResponse->assertJsonPath('data.role', 'user');

    // 3. Log in with stateful cookie and CSRF token
    $loginResponse = $this->withHeaders($authenticatedHeaders)->postJson('/api/v1/auth/login', [
        'email' => 'client@aihome.local',
        'password' => 'Password1234!',
    ]);
    $loginResponse->assertStatus(200);
    $loginResponse->assertJsonPath('data.email', 'client@aihome.local');

    // 4. Access /me as authenticated stateful user
    $meResponse = $this->withHeaders($statefulOrigin)->getJson('/api/v1/auth/me');
    $meResponse->assertStatus(200);
    $meResponse->assertJsonPath('data.email', 'client@aihome.local');
    $meResponse->assertJsonPath('data.role', 'user');
    $meResponse->assertJsonPath('data.abilities', ['own-plans']);

    $sessionResponse = $this->withHeaders($statefulOrigin)->getJson('/api/v1/auth/session');
    $sessionResponse->assertStatus(200);
    $sessionResponse->assertJsonPath('data.email', 'client@aihome.local');

    // 5. Log out with updated CSRF token
    $logoutHeaders = array_merge($statefulOrigin, [
        'X-CSRF-TOKEN' => session()->token(),
    ]);
    $logoutResponse = $this->withHeaders($logoutHeaders)->postJson('/api/v1/auth/logout');
    $logoutResponse->assertStatus(200);
    $logoutResponse->assertJsonPath('message', 'Logged out successfully');

    // 6. Access /me after logout -> 401 UNAUTHENTICATED
    $meAfterLogout = $this->withHeaders($statefulOrigin)->getJson('/api/v1/auth/me');
    $meAfterLogout->assertStatus(401);
    $meAfterLogout->assertJsonPath('code', ApiErrorCode::UNAUTHENTICATED->value);

    $sessionAfterLogout = $this->withHeaders($statefulOrigin)->getJson('/api/v1/auth/session');
    $sessionAfterLogout->assertStatus(200);
    $sessionAfterLogout->assertExactJson(['data' => null]);
});
