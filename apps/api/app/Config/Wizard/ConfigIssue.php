<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Immutable validation issue value object.
 *
 * Mirrors the Issue type in packages/config-schema/src/wizard/issue-codes.ts.
 */
final readonly class ConfigIssue
{
    /**
     * @param  list<string|int>  $path
     */
    public function __construct(
        public array $path,
        public ConfigIssueCode $code,
        public string $message,
    ) {
    }

    /**
     * Return dot-delimited path representation.
     */
    public function getPathString(): string
    {
        if (empty($this->path)) {
            return '.';
        }

        return implode('.', array_map(strval(...), $this->path));
    }

    /**
     * Serialize to associative array.
     *
     * @return array{path: list<string|int>, code: string, message: string}
     */
    public function toArray(): array
    {
        return [
            'path' => $this->path,
            'code' => $this->code->value,
            'message' => $this->message,
        ];
    }
}
