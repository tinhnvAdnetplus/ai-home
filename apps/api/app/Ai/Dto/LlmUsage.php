<?php

declare(strict_types=1);

namespace App\Ai\Dto;

final class LlmUsage
{
    public function __construct(
        public readonly int $inputTokens = 0,
        public readonly int $outputTokens = 0,
    ) {
    }

    /**
     * @return array{inputTokens: int, outputTokens: int}
     */
    public function toArray(): array
    {
        return [
            'inputTokens' => $this->inputTokens,
            'outputTokens' => $this->outputTokens,
        ];
    }
}
