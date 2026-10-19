<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\User;
use Database\Seeders\DevUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();
});

test('seeder creates 4 users in local environment with correct roles and password', function (): void {
    /** @var Tests\TestCase $this */
    $this->app->detectEnvironment(fn () => 'local');

    (new DevUserSeeder())->run();

    expect(User::count())->toBe(4);

    $admin = User::where('email', 'admin@aihome.local')->first();
    expect($admin)->not->toBeNull()
        ->and($admin->role)->toBe(Role::ADMIN)
        ->and(Hash::check(DevUserSeeder::DEFAULT_PASSWORD, $admin->password))->toBeTrue();

    $editor = User::where('email', 'editor@aihome.local')->first();
    expect($editor)->not->toBeNull()
        ->and($editor->role)->toBe(Role::EDITOR)
        ->and(Hash::check(DevUserSeeder::DEFAULT_PASSWORD, $editor->password))->toBeTrue();

    $architect = User::where('email', 'architect@aihome.local')->first();
    expect($architect)->not->toBeNull()
        ->and($architect->role)->toBe(Role::ARCHITECT)
        ->and(Hash::check(DevUserSeeder::DEFAULT_PASSWORD, $architect->password))->toBeTrue();

    $user = User::where('email', 'user@aihome.local')->first();
    expect($user)->not->toBeNull()
        ->and($user->role)->toBe(Role::USER)
        ->and(Hash::check(DevUserSeeder::DEFAULT_PASSWORD, $user->password))->toBeTrue();
});

test('seeder is a no-op in production environment', function (): void {
    /** @var Tests\TestCase $this */
    $this->app->detectEnvironment(fn () => 'production');

    (new DevUserSeeder())->run();

    expect(User::count())->toBe(0);
});

test('seeder is idempotent and does not create duplicates when run multiple times', function (): void {
    /** @var Tests\TestCase $this */
    $this->app->detectEnvironment(fn () => 'local');

    (new DevUserSeeder())->run();
    expect(User::count())->toBe(4);

    (new DevUserSeeder())->run();
    expect(User::count())->toBe(4);

    (new DevUserSeeder())->run();
    expect(User::count())->toBe(4);
});
