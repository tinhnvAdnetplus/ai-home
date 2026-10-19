<?php

declare(strict_types=1);

namespace App\Ai\Dto;

final class LlmResult
{
    /**
     * @param array<string, mixed> $data
     */
    public function __construct(
        public readonly array $data,
        public readonly LlmUsage $usage,
        public readonly int $latencyMs,
        public readonly string $provider,
        public readonly string $model,
        public readonly string $source = '',
        public readonly bool $degraded = false,
    ) {
    }

    /**
     * Return source, defaulting to provider if not explicitly set.
     */
    public function resolvedSource(): string
    {
        return $this->source !== '' ? $this->source : $this->provider;
    }
}
