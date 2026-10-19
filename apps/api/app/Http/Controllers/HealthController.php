<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CheckHealth;
use Illuminate\Http\JsonResponse;

final class HealthController extends Controller
{
    public function __invoke(CheckHealth $checkHealth): JsonResponse
    {
        $health = $checkHealth->execute();

        return response()->json($health, 200);
    }
}
