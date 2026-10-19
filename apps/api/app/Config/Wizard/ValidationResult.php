<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Result of wizard configuration validation.
 *
 * Mirrors ParseWizardResult in packages/config-schema/src/wizard/validate.ts.
 */
final readonly class ValidationResult
{
    /**
     * @param  list<ConfigIssue>  $issues
     * @param  array<string, mixed>|null  $data
     */
    public function __construct(
        public bool $ok,
        public array $issues = [],
        public ?array $data = null,
    ) {
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function success(array $data): self
    {
        return new self(ok: true, issues: [], data: $data);
    }

    /**
     * @param  list<ConfigIssue>  $issues
     */
    public static function failure(array $issues): self
    {
        return new self(ok: false, issues: $issues, data: null);
    }

    public static function fromIssue(ConfigIssue $issue): self
    {
        return new self(ok: false, issues: [$issue], data: null);
    }

    /**
     * Serialize to associative array.
     *
     * @return array{ok: bool, issues: list<array{path: list<string|int>, code: string, message: string}>, data: array<string, mixed>|null}
     */
    public function toArray(): array
    {
        return [
            'ok' => $this->ok,
            'issues' => array_map(fn (ConfigIssue $i) => $i->toArray(), $this->issues),
            'data' => $this->data,
        ];
    }
}
