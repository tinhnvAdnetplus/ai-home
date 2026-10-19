<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureMaxPayloadSize
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, int|string $maxBytes = 32768): Response
    {
        $maxBytes = (int) $maxBytes;
        $contentLength = $request->header('Content-Length');
        if ($contentLength !== null && is_numeric($contentLength) && (int) $contentLength > $maxBytes) {
            throw new PostTooLargeException('Payload exceeds maximum allowed size.');
        }

        if (strlen($request->getContent()) > $maxBytes) {
            throw new PostTooLargeException('Payload exceeds maximum allowed size.');
        }

        return $next($request);
    }
}
