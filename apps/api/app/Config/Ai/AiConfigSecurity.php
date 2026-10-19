<?php

declare(strict_types=1);

namespace App\Config\Ai;

use App\Config\Wizard\ConfigIssue;
use App\Config\Wizard\ConfigIssueCode;

final class AiConfigSecurity
{
    /**
     * @param array<string|int, mixed> $data
     * @param list<string|int> $path
     * @param list<ConfigIssue> $issues
     */
    public static function checkForbiddenKeys(array $data, array $path, array &$issues): void
    {
        foreach ($data as $key => $value) {
            $keyStr = (string) $key;
            $currentPath = [...$path, $keyStr];
            if (preg_match('/(api[_-]?key|^key$|secret|password|credential|access[_-]?token|^token$)/i', $keyStr)) {
                $issues[] = new ConfigIssue($currentPath, ConfigIssueCode::OptionNotAllowed, 'API keys must not be stored in config');

                return;
            }
            if (is_string($value) && (str_starts_with($value, 'AIza') || str_starts_with($value, 'sk-ant-'))) {
                $issues[] = new ConfigIssue($currentPath, ConfigIssueCode::OptionNotAllowed, 'Value resembles an API key');

                return;
            }
            if (is_array($value)) {
                self::checkForbiddenKeys($value, $currentPath, $issues);
            }
        }
    }

    /**
     * @param list<string|int> $path
     * @param list<ConfigIssue> $issues
     */
    public static function validatePlaceholders(string $text, array $path, array &$issues): void
    {
        if (preg_match_all('/\{\{([^}]+)\}\}/', $text, $matches)) {
            foreach ($matches[1] as $ph) {
                $trimmed = trim($ph);
                if ($trimmed !== 'answers' && $trimmed !== 'locale') {
                    $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, "Unknown placeholder '{{{$trimmed}}}'");
                }
            }
        }
    }
}
