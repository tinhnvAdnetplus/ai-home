<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('migrate up, rollback, and migrate up again works cleanly without leaving tables behind', function (): void {
    // 1. Initial state: tables exist after migrations run
    expect(Schema::hasTable('config_documents'))->toBeTrue()
        ->and(Schema::hasTable('config_versions'))->toBeTrue()
        ->and(Schema::hasTable('config_audit_logs'))->toBeTrue();

    // 2. Rollback migrations until config migrations are rolled back
    while (Schema::hasTable('config_documents')) {
        Artisan::call('migrate:rollback', ['--step' => 1]);
    }

    expect(Schema::hasTable('config_audit_logs'))->toBeFalse()
        ->and(Schema::hasTable('config_versions'))->toBeFalse()
        ->and(Schema::hasTable('config_documents'))->toBeFalse();

    // 3. Migrate again to ensure up() works cleanly from clean slate
    Artisan::call('migrate');

    expect(Schema::hasTable('config_documents'))->toBeTrue()
        ->and(Schema::hasTable('config_versions'))->toBeTrue()
        ->and(Schema::hasTable('config_audit_logs'))->toBeTrue();
});
