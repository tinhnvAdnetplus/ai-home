<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Validates individual field semantics (options, numeric ranges, selection limits).
 *
 * Mirrors:
 * - packages/config-schema/src/wizard/field-validator.ts
 * - packages/config-schema/src/wizard/field-options-validator.ts
 */
final class FieldValidator
{
    /**
     * @param  array<string, mixed>  $field
     * @param  list<string|int>  $path
     * @return list<ConfigIssue>
     */
    public static function validate(array $field, array $path): array
    {
        $issues = [];

        if (isset($field['options']) && is_array($field['options'])) {
            self::checkOptions($field, $path, $issues);
            self::checkDefaultInOptions($field, $path, $issues);
        }

        $type = $field['type'] ?? '';
        if ($type === 'number' || $type === 'range') {
            self::checkNumeric($field, $path, $issues);
        }

        if ($type === 'checkbox_group' || $type === 'image_select') {
            self::checkSelectionLimits($field, $path, $issues);
        }

        return $issues;
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     */
    private static function checkOptions(array $field, array $path, array &$issues): void
    {
        /** @var list<array<string, mixed>> $options */
        $options = $field['options'];
        $count = count($options);
        $key = (string) ($field['key'] ?? '');

        if ($count > WizardConstants::MAX_OPTIONS_PER_FIELD) {
            $issues[] = new ConfigIssue(
                [...$path, 'options'],
                ConfigIssueCode::LimitExceeded,
                "Options count {$count} exceeds maximum " . WizardConstants::MAX_OPTIONS_PER_FIELD
            );
        }

        if ($count === 0) {
            $issues[] = new ConfigIssue(
                [...$path, 'options'],
                ConfigIssueCode::EmptyOptions,
                "Field '{$key}' must have at least one option"
            );
        }

        $seenValues = [];
        foreach ($options as $idx => $opt) {
            $optValue = isset($opt['value']) && is_string($opt['value']) ? $opt['value'] : '';
            if (isset($seenValues[$optValue])) {
                $issues[] = new ConfigIssue(
                    [...$path, 'options', $idx, 'value'],
                    ConfigIssueCode::DuplicateKey,
                    "Duplicate option value '{$optValue}' in field '{$key}'"
                );
            } else {
                $seenValues[$optValue] = true;
            }
        }
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     */
    private static function checkDefaultInOptions(array $field, array $path, array &$issues): void
    {
        if (! isset($field['defaultValue'])) {
            return;
        }

        /** @var list<array<string, mixed>> $options */
        $options = $field['options'];
        $valid = [];
        foreach ($options as $opt) {
            if (isset($opt['value']) && is_string($opt['value'])) {
                $valid[$opt['value']] = true;
            }
        }

        $type = $field['type'] ?? '';
        $defaultValue = $field['defaultValue'];

        if (($type === 'select' || $type === 'radio') && is_string($defaultValue)) {
            if (! isset($valid[$defaultValue])) {
                $issues[] = new ConfigIssue(
                    [...$path, 'defaultValue'],
                    ConfigIssueCode::DefaultNotInOptions,
                    "defaultValue '{$defaultValue}' not in available options"
                );
            }
        } elseif ($type === 'checkbox_group' && is_array($defaultValue)) {
            foreach ($defaultValue as $val) {
                if (is_string($val) && ! isset($valid[$val])) {
                    $issues[] = new ConfigIssue(
                        [...$path, 'defaultValue'],
                        ConfigIssueCode::DefaultNotInOptions,
                        'defaultValue contains values not in available options'
                    );
                    break;
                }
            }
        } elseif ($type === 'image_select') {
            $defaults = is_array($defaultValue) ? $defaultValue : [$defaultValue];
            foreach ($defaults as $val) {
                if (is_string($val) && ! isset($valid[$val])) {
                    $issues[] = new ConfigIssue(
                        [...$path, 'defaultValue'],
                        ConfigIssueCode::DefaultNotInOptions,
                        'defaultValue is not among available options'
                    );
                    break;
                }
            }
        }
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     */
    private static function checkNumeric(array $field, array $path, array &$issues): void
    {
        $min = isset($field['min']) && (is_int($field['min']) || is_float($field['min'])) ? $field['min'] : null;
        $max = isset($field['max']) && (is_int($field['max']) || is_float($field['max'])) ? $field['max'] : null;
        $step = isset($field['step']) && (is_int($field['step']) || is_float($field['step'])) ? $field['step'] : null;
        $defaultValue = isset($field['defaultValue']) && (is_int($field['defaultValue']) || is_float($field['defaultValue']))
            ? $field['defaultValue']
            : null;

        if ($min !== null && $max !== null && $min > $max) {
            $issues[] = new ConfigIssue(
                [...$path, 'min'],
                ConfigIssueCode::RangeInvalid,
                "min ({$min}) cannot exceed max ({$max})"
            );
        }

        if ($step !== null && $step <= 0) {
            $issues[] = new ConfigIssue(
                [...$path, 'step'],
                ConfigIssueCode::RangeInvalid,
                "step must be positive, got {$step}"
            );
        }

        if ($defaultValue !== null) {
            if ($min !== null && $defaultValue < $min) {
                $issues[] = new ConfigIssue(
                    [...$path, 'defaultValue'],
                    ConfigIssueCode::DefaultOutOfRange,
                    "defaultValue {$defaultValue} < min {$min}"
                );
            }
            if ($max !== null && $defaultValue > $max) {
                $issues[] = new ConfigIssue(
                    [...$path, 'defaultValue'],
                    ConfigIssueCode::DefaultOutOfRange,
                    "defaultValue {$defaultValue} > max {$max}"
                );
            }
        }
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     */
    private static function checkSelectionLimits(array $field, array $path, array &$issues): void
    {
        /** @var list<mixed> $options */
        $options = $field['options'] ?? [];
        $count = count($options);
        $minSelected = isset($field['minSelected']) && WizardNumbers::isIntegral($field['minSelected']) ? (int) $field['minSelected'] : null;
        $maxSelected = isset($field['maxSelected']) && WizardNumbers::isIntegral($field['maxSelected']) ? (int) $field['maxSelected'] : null;

        if ($minSelected !== null && $maxSelected !== null && $minSelected > $maxSelected) {
            $issues[] = new ConfigIssue(
                [...$path, 'minSelected'],
                ConfigIssueCode::SelectionLimitsInvalid,
                "minSelected ({$minSelected}) > maxSelected ({$maxSelected})"
            );
        }

        if ($minSelected !== null && ($minSelected < 0 || $minSelected > $count)) {
            $issues[] = new ConfigIssue(
                [...$path, 'minSelected'],
                ConfigIssueCode::SelectionLimitsInvalid,
                "minSelected must be between 0 and {$count}"
            );
        }

        if ($maxSelected !== null && ($maxSelected <= 0 || $maxSelected > $count)) {
            $issues[] = new ConfigIssue(
                [...$path, 'maxSelected'],
                ConfigIssueCode::SelectionLimitsInvalid,
                "maxSelected must be between 1 and {$count}"
            );
        }
    }
}
