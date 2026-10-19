<?php

declare(strict_types=1);

arch('app uses strict types')
    ->expect('App')
    ->toUseStrictTypes();

arch('app does not use debugging functions')
    ->expect(['dd', 'dump', 'var_dump', 'print_r', 'ray', 'die', 'exit'])
    ->not->toBeUsed();

arch('controllers')
    ->expect('App\Http\Controllers')
    ->toHaveSuffix('Controller')
    ->ignoring('App\Http\Controllers\Controller')
    ->toExtend('App\Http\Controllers\Controller')
    ->not->toUse('Illuminate\Support\Facades\DB');

arch('actions')
    ->expect('App\Actions')
    ->toBeFinal()
    ->toOnlyBeUsedIn(['App\Http\Controllers', 'App\Jobs', 'App\Console\Commands', 'App\Actions']);

arch('requests')
    ->expect('App\Http\Requests')
    ->toExtend('Illuminate\Foundation\Http\FormRequest');

arch('enums')
    ->expect('App\Enums')
    ->toBeEnums();

arch('support classes')
    ->expect('App\Support')
    ->classes()
    ->toBeFinal();

test('routes contain no closures', function (): void {
    $routesDir = dirname(__DIR__, 2).'/routes';
    /** @var array<string> $routeFiles */
    $routeFiles = glob($routesDir.'/*.php') ?: [];
    expect($routeFiles)->not->toBeEmpty();

    foreach ($routeFiles as $file) {
        $content = (string) file_get_contents($file);
        expect(preg_match('/function\s*\(/', $content))->toBe(0)
            ->and(preg_match('/fn\s*\(/', $content))->toBe(0);
    }
});
