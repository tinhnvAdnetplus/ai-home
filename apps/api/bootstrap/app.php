<?php

declare(strict_types=1);

use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\EnsureMaxPayloadSize;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\ForceJsonResponse;
use App\Support\ApiProblem;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->prepend(AssignRequestId::class);
        $middleware->alias([
            'role' => EnsureRole::class,
            'max.payload' => EnsureMaxPayloadSize::class,
        ]);
        $middleware->api(append: [
            ForceJsonResponse::class,
            'throttle:api',
        ]);
        $middleware->redirectGuestsTo(fn (): ?string => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e): bool {
            return $request->is('api', 'api/*');
        });

        $exceptions->render(function (Throwable $e, Request $request): ?JsonResponse {
            if ($request->is('api', 'api/*')) {
                return ApiProblem::toResponse($e, $request);
            }

            return null;
        });
    })->create();
