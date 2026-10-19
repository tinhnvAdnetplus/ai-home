<?php

declare(strict_types=1);

namespace App\Ai\Dto;

final class LlmRequest
{
    /**
     * @param array<string, mixed> $jsonSchema
     */
    public function __construct(
        public readonly string $systemPrompt,
        public readonly string $userContent,
        public readonly array $jsonSchema,
        public readonly float $temperature = 0.2,
        public readonly int $maxTokens = 2048,
        public readonly int $timeout = 20,
        public readonly ?int $thinkingBudget = 0,
    ) {
    }
}
