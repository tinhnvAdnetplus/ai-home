<?php

declare(strict_types=1);

namespace App\Config\Ai;

use App\Config\Wizard\ConfigIssue;
use App\Config\Wizard\ConfigIssueCode;
use App\Config\Wizard\ValidationResult;
use Throwable;

final class AiConfigValidator
{
    private const ALLOWED_ROOT_KEYS = [
        'schemaVersion', 'provider', 'model', 'temperature',
        'maxTokens', 'dailyLimit', 'timeoutSeconds', 'prompts', 'enabled',
    ];

    private const ALLOWED_PROVIDERS = ['gemini', 'claude', 'local'];

    public static function validate(mixed $input): ValidationResult
    {
        if (! is_array($input) || (count($input) > 0 && array_is_list($input))) {
            return ValidationResult::fromIssue(
                new ConfigIssue([], ConfigIssueCode::SchemaInvalid, 'Expected JSON object at root')
            );
        }

        $issues = [];
        AiConfigSecurity::checkForbiddenKeys($input, [], $issues);
        if (! empty($issues)) {
            return ValidationResult::failure($issues);
        }

        foreach (array_keys($input) as $key) {
            $keyStr = (string) $key;
            if (! in_array($keyStr, self::ALLOWED_ROOT_KEYS, true)) {
                $issues[] = new ConfigIssue([$keyStr], ConfigIssueCode::UnknownKey, "Unknown key '{$keyStr}'");
            }
        }

        self::validateFields($input, $issues);
        self::validatePrompts($input, $issues);

        if (! empty($issues)) {
            return ValidationResult::failure($issues);
        }

        /** @var array<string, mixed> $normalized */
        $normalized = $input;
        $normalized['schemaVersion'] = (int) ($input['schemaVersion'] ?? 1);

        return ValidationResult::success($normalized);
    }

    public static function validateJson(string $json): ValidationResult
    {
        try {
            if (strlen($json) > 1_048_576) {
                return ValidationResult::fromIssue(
                    new ConfigIssue([], ConfigIssueCode::LimitExceeded, 'JSON payload exceeds 1 MB')
                );
            }
            /** @var mixed $decoded */
            $decoded = json_decode($json, true, 64, JSON_THROW_ON_ERROR);

            return self::validate($decoded);
        } catch (Throwable $e) {
            return ValidationResult::fromIssue(
                new ConfigIssue([], ConfigIssueCode::SchemaInvalid, 'Invalid JSON: '.$e->getMessage())
            );
        }
    }

    /**
     * @param array<string, mixed> $in
     * @param list<ConfigIssue> $issues
     */
    private static function validateFields(array $in, array &$issues): void
    {
        $provider = $in['provider'] ?? null;
        if (! is_string($provider) || ! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            $issues[] = new ConfigIssue(['provider'], ConfigIssueCode::OptionNotAllowed, 'provider must be gemini, claude, or local');
        }

        $model = $in['model'] ?? null;
        if (! is_string($model) || ! preg_match('/^(gemini-[a-zA-Z0-9._-]+|claude-[a-zA-Z0-9._-]+|local(-[a-zA-Z0-9._-]+)?)$/', $model)) {
            $issues[] = new ConfigIssue(['model'], ConfigIssueCode::SchemaInvalid, 'model must match allow-list pattern');
        }

        $temp = $in['temperature'] ?? null;
        if (! is_numeric($temp) || (float) $temp < 0.0 || (float) $temp > 1.0) {
            $issues[] = new ConfigIssue(['temperature'], ConfigIssueCode::OutOfRange, 'temperature must be between 0 and 1');
        }

        $maxTokens = $in['maxTokens'] ?? null;
        if (! is_int($maxTokens) || $maxTokens < 256 || $maxTokens > 4096) {
            $issues[] = new ConfigIssue(['maxTokens'], ConfigIssueCode::OutOfRange, 'maxTokens must be 256..4096');
        }

        $dailyLimit = $in['dailyLimit'] ?? null;
        if (! is_int($dailyLimit) || $dailyLimit < 1 || $dailyLimit > 10000) {
            $issues[] = new ConfigIssue(['dailyLimit'], ConfigIssueCode::OutOfRange, 'dailyLimit must be 1..10000');
        }

        $timeout = $in['timeoutSeconds'] ?? null;
        if (! is_int($timeout) || $timeout < 5 || $timeout > 60) {
            $issues[] = new ConfigIssue(['timeoutSeconds'], ConfigIssueCode::OutOfRange, 'timeoutSeconds must be 5..60');
        }

        if (! isset($in['enabled']) || ! is_bool($in['enabled'])) {
            $issues[] = new ConfigIssue(['enabled'], ConfigIssueCode::WrongType, 'enabled must be boolean');
        }
    }

    /**
     * @param array<string, mixed> $in
     * @param list<ConfigIssue> $issues
     */
    private static function validatePrompts(array $in, array &$issues): void
    {
        $prompts = $in['prompts'] ?? null;
        if (! is_array($prompts)) {
            $issues[] = new ConfigIssue(['prompts'], ConfigIssueCode::RequiredMissing, 'prompts is required');

            return;
        }

        foreach (['constraints', 'commentary'] as $type) {
            if (! isset($prompts[$type]) || ! is_array($prompts[$type])) {
                $issues[] = new ConfigIssue(['prompts', $type], ConfigIssueCode::RequiredMissing, "prompts.{$type} is required");
                continue;
            }
            $pGroup = $prompts[$type];
            if (! isset($pGroup['ja']) || ! is_string($pGroup['ja']) || trim($pGroup['ja']) === '') {
                $issues[] = new ConfigIssue(['prompts', $type, 'ja'], ConfigIssueCode::RequiredMissing, "prompts.{$type}.ja is required");
            }
            foreach ($pGroup as $loc => $text) {
                $locStr = (string) $loc;
                if (! in_array($locStr, ['ja', 'en', 'vi'], true)) {
                    $issues[] = new ConfigIssue(['prompts', $type, $locStr], ConfigIssueCode::UnknownKey, "Unknown locale '{$locStr}'");
                } elseif (! is_string($text) || mb_strlen($text, 'UTF-8') > 8000) {
                    $issues[] = new ConfigIssue(['prompts', $type, $locStr], ConfigIssueCode::OutOfRange, 'Prompt exceeds 8000 characters');
                } else {
                    AiConfigSecurity::validatePlaceholders($text, ['prompts', $type, $locStr], $issues);
                }
            }
        }
    }
}
