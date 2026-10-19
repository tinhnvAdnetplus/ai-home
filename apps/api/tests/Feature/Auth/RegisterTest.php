<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\User;
use App\Support\ApiErrorCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();
});

test('registers a new user successfully with 201 status, role user, and hashed password', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);

    $response->assertStatus(201);
    $response->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body)->toHaveKey('data')
        ->and($body['data']['name'])->toBe('John Doe')
        ->and($body['data']['email'])->toBe('john@example.com')
        ->and($body['data']['role'])->toBe('user')
        ->and($body['data']['abilities'])->toContain('own-plans')
        ->and($body['data'])->not->toHaveKey('password')
        ->and($body['data'])->not->toHaveKey('remember_token');

    $user = User::where('email', 'john@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe(Role::USER)
        ->and(Hash::check('Password1234!', $user->password))->toBeTrue()
        ->and($user->password)->not->toBe('Password1234!');
});

test('ignores role in payload and always creates role user', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Privilege Escalation Attempt',
        'email' => 'hacker@example.com',
        'role' => 'admin',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('data.role', 'user');

    $user = User::where('email', 'hacker@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe(Role::USER);
});

test('rejects duplicate email case-insensitively with 422 problem+json', function (): void {
    /** @var Tests\TestCase $this */
    User::factory()->create([
        'email' => 'existing@example.com',
    ]);

    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Duplicate User',
        'email' => 'EXISTING@EXAMPLE.COM',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);

    $response->assertStatus(422);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertJsonPath('code', ApiErrorCode::VALIDATION_FAILED->value);
    $response->assertJsonPath('status', 422);
    $response->assertJsonValidationErrors(['email']);
});

test('rejects weak or short password under 10 characters', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Short Password',
        'email' => 'short@example.com',
        'password' => 'Short1!',
        'password_confirmation' => 'Short1!',
    ]);

    $response->assertStatus(422);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertJsonPath('code', ApiErrorCode::VALIDATION_FAILED->value);
    $response->assertJsonValidationErrors(['password']);
});

test('rejects password matching email address', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Matching Password',
        'email' => 'testuser@example.com',
        'password' => 'TESTUSER@EXAMPLE.COM',
        'password_confirmation' => 'TESTUSER@EXAMPLE.COM',
    ]);

    $response->assertStatus(422);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertJsonValidationErrors(['password']);
});

test('rejects missing and blank required fields', function (): void {
    /** @var Tests\TestCase $this */
    $resMissing = $this->postJson('/api/v1/auth/register', []);
    $resMissing->assertStatus(422);
    $resMissing->assertJsonValidationErrors(['name', 'email', 'password', 'password_confirmation']);

    $resBlank = $this->postJson('/api/v1/auth/register', [
        'name' => '',
        'email' => '',
        'password' => '',
        'password_confirmation' => '',
    ]);
    $resBlank->assertStatus(422);
    $resBlank->assertJsonValidationErrors(['name', 'email', 'password', 'password_confirmation']);
});

test('normalises email with surrounding spaces and mixed case', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Spaced User',
        'email' => '   Spaced.User@Example.Com   ',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('data.email', 'spaced.user@example.com');

    expect(User::where('email', 'spaced.user@example.com')->exists())->toBeTrue();
});

test('rejects very long name exceeding 255 characters', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => str_repeat('a', 256),
        'email' => 'longname@example.com',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name']);
});

test('accepts Japanese name without encoding corruption', function (): void {
    /** @var Tests\TestCase $this */
    $japaneseName = '山田 太郎';
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => $japaneseName,
        'email' => 'yamada@example.com',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('data.name', $japaneseName);

    $user = User::where('email', 'yamada@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe($japaneseName);
});

test('throttles registration after 5 requests per minute per IP', function (): void {
    /** @var Tests\TestCase $this */
    RateLimiter::clear('auth-register:10.0.0.1');
    RateLimiter::clear('auth-register:10.0.0.2');

    for ($i = 1; $i <= 5; $i++) {
        $res = $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.1'])->postJson('/api/v1/auth/register', [
            'name' => "User {$i}",
            'email' => "user{$i}@example.com",
            'password' => 'Password1234!',
            'password_confirmation' => 'Password1234!',
        ]);
        $res->assertStatus(201);
    }

    // 6th request from 10.0.0.1 is throttled
    $resThrottled = $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.1'])->postJson('/api/v1/auth/register', [
        'name' => 'User 6',
        'email' => 'user6@example.com',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);
    $resThrottled->assertStatus(429);
    $resThrottled->assertHeader('Content-Type', 'application/problem+json');
    $resThrottled->assertHeader('Retry-After');
    $resThrottled->assertJsonPath('code', ApiErrorCode::TOO_MANY_REQUESTS->value);

    // Different IP 10.0.0.2 is unaffected
    $resOtherIp = $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])->postJson('/api/v1/auth/register', [
        'name' => 'Other User',
        'email' => 'otheruser@example.com',
        'password' => 'Password1234!',
        'password_confirmation' => 'Password1234!',
    ]);
    $resOtherIp->assertStatus(201);
});

test('mass assignment on User model cannot update role via update or fill', function (): void {
    /** @var Tests\TestCase $this */
    $user = User::factory()->create([
        'role' => Role::USER,
    ]);

    $user->update([
        'role' => Role::ADMIN->value,
    ]);
    $user->refresh();

    expect($user->role)->toBe(Role::USER);

    $user->fill([
        'role' => Role::ADMIN->value,
    ]);
    $user->save();
    $user->refresh();

    expect($user->role)->toBe(Role::USER);
});
