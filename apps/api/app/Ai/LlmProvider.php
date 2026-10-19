<?php

declare(strict_types=1);

namespace App\Ai;

use App\Ai\Dto\LlmRequest;
use App\Ai\Dto\LlmResult;

interface LlmProvider
{
    /**
     * Generate structured JSON conforming to the requested schema.
     */
    public function generateJson(LlmRequest $req): LlmResult;
}
