<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\BuildConfigBundle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ConfigBundleController extends Controller
{
    /**
     * Return the public configuration bundle containing only published configurations.
     */
    public function show(Request $request, BuildConfigBundle $action): JsonResponse|Response
    {
        $bundle = $action->handle();

        $ifNoneMatch = $request->header('If-None-Match');
        if ($ifNoneMatch !== null) {
            $normalizedHeader = trim($ifNoneMatch, '"');
            if ($normalizedHeader === $bundle['raw_etag'] || $ifNoneMatch === $bundle['etag']) {
                return new Response('', 304, [
                    'ETag' => $bundle['etag'],
                    'Cache-Control' => 'no-cache',
                ]);
            }
        }

        return new JsonResponse(
            data: [
                'etag' => $bundle['etag'],
                'configs' => $bundle['configs'],
            ],
            status: 200,
            headers: [
                'ETag' => $bundle['etag'],
                'Cache-Control' => 'no-cache',
            ],
            options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }
}
