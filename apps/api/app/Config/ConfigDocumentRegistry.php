<?php

declare(strict_types=1);

namespace App\Config;

use App\Config\Wizard\WizardConfigValidator;

final class ConfigDocumentRegistry
{
    /**
     * Registry mapping of document keys to validator class and default scope.
     *
     * @var array<string, array{validator: class-string, scope: string}>
     */
    private static array $documents = [
        'wizard' => [
            'validator' => WizardConfigValidator::class,
            'scope' => 'global',
        ],
        'ai' => [
            'validator' => \App\Config\Ai\AiConfigValidator::class,
            'scope' => 'global',
        ],
    ];

    public static function has(string $key): bool
    {
        return isset(self::$documents[$key]);
    }

    /**
     * @return class-string|null
     */
    public static function getValidator(string $key): ?string
    {
        return self::$documents[$key]['validator'] ?? null;
    }

    public static function getScope(string $key): string
    {
        return self::$documents[$key]['scope'] ?? 'global';
    }

    /**
     * @return list<string>
     */
    public static function allKeys(): array
    {
        return array_keys(self::$documents);
    }

    /**
     * Register or override a document type configuration.
     *
     * @param  class-string  $validatorClass
     */
    public static function register(string $key, string $validatorClass, string $scope = 'global'): void
    {
        self::$documents[$key] = [
            'validator' => $validatorClass,
            'scope' => $scope,
        ];
    }
}
