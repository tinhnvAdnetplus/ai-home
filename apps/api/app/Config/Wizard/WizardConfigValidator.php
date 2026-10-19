<?php

declare(strict_types=1);

namespace App\Config\Wizard;

use JsonException;
use Throwable;

/**
 * Main wizard configuration validator.
 *
 * Implements the exact validation rules and limits of packages/config-schema.
 * Guarantees bounded CPU and memory consumption; never throws on hostile inputs.
 */
final class WizardConfigValidator
{
    /**
     * Validate an arbitrary in-memory data structure (already decoded JSON array).
     */
    public static function validate(mixed $input): ValidationResult
    {
        try {
            // 1. Cheap structural limit pre-check before walking
            $precheckIssues = LimitPrecheck::check($input);
            if (! empty($precheckIssues)) {
                return ValidationResult::failure($precheckIssues);
            }

            // 2. Strict structural type validation and text normalization
            $structural = StructuralValidator::validateAndNormalize($input);
            if (! empty($structural['issues'])) {
                return ValidationResult::failure($structural['issues']);
            }

            /** @var array<string, mixed> $normalizedData */
            $normalizedData = $structural['data'];

            // 3. Cross-validation (duplicates, references, cycles, bindings, semantics)
            $crossIssues = CrossValidator::validate($normalizedData);
            if (! empty($crossIssues)) {
                return ValidationResult::failure($crossIssues);
            }

            return ValidationResult::success($normalizedData);
        } catch (Throwable $e) {
            return ValidationResult::fromIssue(
                new ConfigIssue([], ConfigIssueCode::SchemaInvalid, $e->getMessage())
            );
        }
    }

    /**
     * Validate a raw JSON string.
     *
     * Enforces a 1 MB pre-decode size cap and maximum 64-level JSON nesting depth.
     */
    public static function validateJson(string $json): ValidationResult
    {
        try {
            if (strlen($json) > WizardConstants::MAX_JSON_SIZE_BYTES) {
                return ValidationResult::fromIssue(
                    new ConfigIssue([], ConfigIssueCode::SchemaInvalid, 'JSON payload exceeds 1 MB limit')
                );
            }

            /** @var mixed $decoded */
            $decoded = json_decode(
                $json,
                associative: true,
                depth: 64,
                flags: JSON_THROW_ON_ERROR | JSON_BIGINT_AS_STRING
            );

            if (! is_array($decoded) || (count($decoded) > 0 && array_is_list($decoded))) {
                return ValidationResult::fromIssue(
                    new ConfigIssue([], ConfigIssueCode::SchemaInvalid, 'Expected JSON object at root')
                );
            }

            return self::validate($decoded);
        } catch (JsonException $e) {
            return ValidationResult::fromIssue(
                new ConfigIssue([], ConfigIssueCode::SchemaInvalid, 'Invalid JSON: ' . $e->getMessage())
            );
        } catch (Throwable $e) {
            return ValidationResult::fromIssue(
                new ConfigIssue([], ConfigIssueCode::SchemaInvalid, $e->getMessage())
            );
        }
    }
}
