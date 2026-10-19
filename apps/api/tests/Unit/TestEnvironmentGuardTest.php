<?php

declare(strict_types=1);

test('the suite runs on isolated in-memory drivers, never on the developer database', function (): void {
    expect(config('database.default'))->toBe('sqlite')
        ->and(config('database.connections.sqlite.database'))->toBe(':memory:')
        ->and(config('mail.default'))->toBe('array')
        ->and(config('queue.default'))->toBe('sync')
        ->and(config('session.driver'))->toBe('array')
        ->and(config('cache.default'))->toBe('array')
        ->and(app()->environment())->toBe('testing');
});
