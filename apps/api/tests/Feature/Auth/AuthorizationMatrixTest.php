<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\User;
use App\Support\Ability;
use App\Support\ApiErrorCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    Route::middleware('api')->prefix('api/test/auth-matrix')->group(function (): void {
        Route::middleware(['auth:sanctum', 'role:admin'])->get('admin-only', function () {
            return response()->json(['data' => 'admin_secret']);
        });

        Route::middleware(['auth:sanctum', 'role:admin,editor'])->get('admin-or-editor', function () {
            return response()->json(['data' => 'editor_secret']);
        });

        Route::middleware(['auth:sanctum', 'role:admin,architect'])->get('admin-or-architect', function () {
            return response()->json(['data' => 'architect_secret']);
        });
    });
});

test('authorization ability matrix exactly matches specification for all 4 roles x 4 abilities', function (
    Role $role,
    string $ability,
    bool $expectedAllowed
): void {
    $user = User::factory()->make([
        'role' => $role,
    ]);

    $allowed = Gate::forUser($user)->allows($ability);

    expect($allowed)->toBe($expectedAllowed, "Expected {$role->value} to ".($expectedAllowed ? 'allow' : 'deny')." {$ability}");
})->with([
    // admin: all 4 allowed
    'admin -> manage-config' => [Role::ADMIN, Ability::MANAGE_CONFIG, true],
    'admin -> manage-users'  => [Role::ADMIN, Ability::MANAGE_USERS, true],
    'admin -> review-plans'  => [Role::ADMIN, Ability::REVIEW_PLANS, true],
    'admin -> own-plans'     => [Role::ADMIN, Ability::OWN_PLANS, true],

    // editor: manage-config and own-plans allowed; others denied
    'editor -> manage-config' => [Role::EDITOR, Ability::MANAGE_CONFIG, true],
    'editor -> manage-users'  => [Role::EDITOR, Ability::MANAGE_USERS, false],
    'editor -> review-plans'  => [Role::EDITOR, Ability::REVIEW_PLANS, false],
    'editor -> own-plans'     => [Role::EDITOR, Ability::OWN_PLANS, true],

    // architect: review-plans and own-plans allowed; others denied
    'architect -> manage-config' => [Role::ARCHITECT, Ability::MANAGE_CONFIG, false],
    'architect -> manage-users'  => [Role::ARCHITECT, Ability::MANAGE_USERS, false],
    'architect -> review-plans'  => [Role::ARCHITECT, Ability::REVIEW_PLANS, true],
    'architect -> own-plans'     => [Role::ARCHITECT, Ability::OWN_PLANS, true],

    // user: own-plans allowed; others denied
    'user -> manage-config' => [Role::USER, Ability::MANAGE_CONFIG, false],
    'user -> manage-users'  => [Role::USER, Ability::MANAGE_USERS, false],
    'user -> review-plans'  => [Role::USER, Ability::REVIEW_PLANS, false],
    'user -> own-plans'     => [Role::USER, Ability::OWN_PLANS, true],
]);

test('role middleware allows authorized role and returns 200', function (): void {
    /** @var Tests\TestCase $this */
    $admin = User::factory()->make(['role' => Role::ADMIN]);
    $editor = User::factory()->make(['role' => Role::EDITOR]);
    $architect = User::factory()->make(['role' => Role::ARCHITECT]);

    $this->actingAs($admin)->getJson('/api/test/auth-matrix/admin-only')
        ->assertStatus(200)
        ->assertJsonPath('data', 'admin_secret');

    $this->actingAs($editor)->getJson('/api/test/auth-matrix/admin-or-editor')
        ->assertStatus(200)
        ->assertJsonPath('data', 'editor_secret');

    $this->actingAs($architect)->getJson('/api/test/auth-matrix/admin-or-architect')
        ->assertStatus(200)
        ->assertJsonPath('data', 'architect_secret');
});

test('role middleware denies unauthorized role and returns standard 403 problem body', function (): void {
    /** @var Tests\TestCase $this */
    $user = User::factory()->make(['role' => Role::USER]);
    $editor = User::factory()->make(['role' => Role::EDITOR]);

    // User accessing admin-only route
    $resUser = $this->actingAs($user)->getJson('/api/test/auth-matrix/admin-only');
    $resUser->assertStatus(403);
    expect($resUser->headers->get('Content-Type'))->toContain('application/problem+json');
    $resUser->assertJsonPath('code', ApiErrorCode::FORBIDDEN->value);
    $resUser->assertJsonPath('status', 403);
    $resUser->assertJsonPath('title', 'Forbidden');
    $resUser->assertJsonPath('detail', 'This action is unauthorized.');
    expect($resUser->json('request_id'))->toBeString();

    // Editor accessing admin-only route
    $resEditor = $this->actingAs($editor)->getJson('/api/test/auth-matrix/admin-only');
    $resEditor->assertStatus(403);
    $resEditor->assertJsonPath('code', ApiErrorCode::FORBIDDEN->value);
});

test('unauthenticated request to role-protected route gets 401 UNAUTHENTICATED, not 403', function (): void {
    /** @var Tests\TestCase $this */
    $response = $this->getJson('/api/test/auth-matrix/admin-only');

    $response->assertStatus(401);
    expect($response->headers->get('Content-Type'))->toContain('application/problem+json');
    $response->assertJsonPath('code', ApiErrorCode::UNAUTHENTICATED->value);
    $response->assertJsonPath('status', 401);
    expect($response->json('request_id'))->toBeString();
});
