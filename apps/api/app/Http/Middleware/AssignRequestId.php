<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\RequestId;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

final class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = RequestId::resolve($request);

        Log::withContext([
            'request_id' => $requestId,
        ]);

        $response = $next($request);

        if ($request->is('api', 'api/*')) {
            $response->headers->set(RequestId::HEADER, $requestId);
        }

        return $response;
    }
}
