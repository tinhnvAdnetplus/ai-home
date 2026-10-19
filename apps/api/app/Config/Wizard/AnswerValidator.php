<?php

declare(strict_types=1);

namespace App\Config\Wizard;

use Throwable;

/**
 * Validates user answers against a wizard configuration.
 *
 * Enforces strict typing, range boundaries, option whitelists, unknown key detection,
 * and completion checks at submit time.
 */
final class AnswerValidator
{
    /**
     * Validate an answers payload against a wizard configuration.
     *
     * @param array<string, mixed> $wizard
     * @param mixed $answers
     * @param bool $requireCompleted When true, enforces that all visible, non-disabled required fields are answered.
     * @return ValidationResult
     */
    public static function validate(array $wizard, mixed $answers, bool $requireCompleted = false): ValidationResult
    {
        try {
            if (!is_array($answers)) {
                return ValidationResult::failure([
                    new ConfigIssue(['answers'], ConfigIssueCode::SchemaInvalid, 'Answers payload must be an associative array.'),
                ]);
            }

            // Guard against DoS via huge payloads
            if (count($answers) > WizardConstants::MAX_FIELDS_TOTAL + 50) {
                return ValidationResult::failure([
                    new ConfigIssue(['answers'], ConfigIssueCode::LimitExceeded, 'Number of answer keys exceeds maximum allowed limit.'),
                ]);
            }

            $allFields = AnswerResolver::collectFields($wizard);
            /** @var array<string, array<string, mixed>> $fieldMap */
            $fieldMap = [];
            foreach ($allFields as $field) {
                $fieldMap[$field['key']] = $field;
            }

            /** @var list<ConfigIssue> $issues */
            $issues = [];

            // 1. Check for unknown keys
            foreach (array_keys($answers) as $key) {
                if (!is_string($key) || !isset($fieldMap[$key])) {
                    $issues[] = new ConfigIssue(
                        ['answers', (string) $key],
                        ConfigIssueCode::UnknownKey,
                        "Unknown answer key: '{$key}'."
                    );
                }
            }

            // 2. Validate known keys for correct types, ranges, options
            foreach ($answers as $key => $val) {
                if (!is_string($key) || !isset($fieldMap[$key])) {
                    continue;
                }

                $field = $fieldMap[$key];
                $type = (string) ($field['type'] ?? 'text');

                // Null is acceptable during draft saving as an unset/cleared field
                if ($val === null) {
                    continue;
                }

                switch ($type) {
                    case 'text':
                        if (!is_string($val)) {
                            $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be a string.");
                        } else {
                            $maxLen = (int) ($field['maxLength'] ?? WizardConstants::MAX_TEXT_LENGTH);
                            if (mb_strlen($val, 'UTF-8') > $maxLen) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OutOfRange, "Field '{$key}' exceeds maximum length of {$maxLen} characters.");
                            }
                        }
                        break;

                    case 'textarea':
                        if (!is_string($val)) {
                            $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be a string.");
                        } else {
                            $maxLen = (int) ($field['maxLength'] ?? WizardConstants::MAX_TEXTAREA_LENGTH);
                            if (mb_strlen($val, 'UTF-8') > $maxLen) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OutOfRange, "Field '{$key}' exceeds maximum length of {$maxLen} characters.");
                            }
                        }
                        break;

                    case 'number':
                    case 'range':
                        if ((!is_int($val) && !is_float($val)) || !is_finite((float) $val)) {
                            $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be a finite number.");
                        } else {
                            $num = (float) $val;
                            if (isset($field['min']) && $num < (float) $field['min']) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OutOfRange, "Field '{$key}' value {$num} is less than minimum {$field['min']}.");
                            }
                            if (isset($field['max']) && $num > (float) $field['max']) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OutOfRange, "Field '{$key}' value {$num} exceeds maximum {$field['max']}.");
                            }
                        }
                        break;

                    case 'boolean':
                        if (!is_bool($val)) {
                            $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be a boolean.");
                        }
                        break;

                    case 'select':
                    case 'radio':
                        if (!is_string($val)) {
                            $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be a string.");
                        } else {
                            /** @var list<string> $allowed */
                            $allowed = array_column((array) ($field['options'] ?? []), 'value');
                            if (!in_array($val, $allowed, true)) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OptionNotAllowed, "Option '{$val}' is not allowed for field '{$key}'.");
                            }
                        }
                        break;

                    case 'checkbox_group':
                        if (!is_array($val) || !array_is_list($val)) {
                            $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be an array of option strings.");
                        } else {
                            /** @var list<string> $allowed */
                            $allowed = array_column((array) ($field['options'] ?? []), 'value');
                            foreach ($val as $idx => $item) {
                                if (!is_string($item)) {
                                    $issues[] = new ConfigIssue(['answers', $key, $idx], ConfigIssueCode::WrongType, "Item at index {$idx} for field '{$key}' must be a string.");
                                } elseif (!in_array($item, $allowed, true)) {
                                    $issues[] = new ConfigIssue(['answers', $key, $idx], ConfigIssueCode::OptionNotAllowed, "Option '{$item}' is not allowed for field '{$key}'.");
                                }
                            }
                            if (isset($field['minSelected']) && count($val) < (int) $field['minSelected']) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OutOfRange, "Field '{$key}' requires at least {$field['minSelected']} selected options.");
                            }
                            if (isset($field['maxSelected']) && count($val) > (int) $field['maxSelected']) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OutOfRange, "Field '{$key}' allows at most {$field['maxSelected']} selected options.");
                            }
                        }
                        break;

                    case 'image_select':
                        $isMulti = (bool) ($field['multiple'] ?? false);
                        /** @var list<string> $allowed */
                        $allowed = array_column((array) ($field['options'] ?? []), 'value');

                        if ($isMulti) {
                            if (!is_array($val) || !array_is_list($val)) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be an array of option strings.");
                            } else {
                                foreach ($val as $idx => $item) {
                                    if (!is_string($item)) {
                                        $issues[] = new ConfigIssue(['answers', $key, $idx], ConfigIssueCode::WrongType, "Item at index {$idx} for field '{$key}' must be a string.");
                                    } elseif (!in_array($item, $allowed, true)) {
                                        $issues[] = new ConfigIssue(['answers', $key, $idx], ConfigIssueCode::OptionNotAllowed, "Option '{$item}' is not allowed for field '{$key}'.");
                                    }
                                }
                            }
                        } else {
                            if (!is_string($val)) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be a string.");
                            } elseif (!in_array($val, $allowed, true)) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OptionNotAllowed, "Option '{$val}' is not allowed for field '{$key}'.");
                            }
                        }
                        break;

                    case 'upload':
                        if (!is_string($val) && !is_array($val)) {
                            $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be a string media reference or list of references.");
                        } elseif (is_array($val)) {
                            if (!array_is_list($val)) {
                                $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::WrongType, "Field '{$key}' must be a sequential array of media references.");
                            } else {
                                foreach ($val as $idx => $item) {
                                    if (!is_string($item)) {
                                        $issues[] = new ConfigIssue(['answers', $key, $idx], ConfigIssueCode::WrongType, "Item at index {$idx} for field '{$key}' must be a string.");
                                    }
                                }
                                if (isset($field['maxFiles']) && count($val) > (int) $field['maxFiles']) {
                                    $issues[] = new ConfigIssue(['answers', $key], ConfigIssueCode::OutOfRange, "Field '{$key}' exceeds maximum allowed files count of {$field['maxFiles']}.");
                                }
                            }
                        }
                        break;
                }
            }

            // Return early if any structural or typing issues occurred
            if (!empty($issues)) {
                return ValidationResult::failure($issues);
            }

            // 3. Resolve wizard state and prune answers
            $state = AnswerResolver::resolveWizardState($wizard, $answers);

            // 4. If submit mode, enforce required fields
            if ($requireCompleted) {
                if (!empty($state['missingRequired'])) {
                    foreach ($state['missingRequired'] as $missingKey) {
                        $issues[] = new ConfigIssue(
                            ['answers', $missingKey],
                            ConfigIssueCode::RequiredMissing,
                            "Required field '{$missingKey}' is missing or empty."
                        );
                    }

                    return ValidationResult::failure($issues);
                }
            }

            return ValidationResult::success($state['answers']);
        } catch (Throwable $e) {
            return ValidationResult::failure([
                new ConfigIssue(['answers'], ConfigIssueCode::SchemaInvalid, $e->getMessage()),
            ]);
        }
    }

    /**
     * Helper to validate answers strictly for submit.
     *
     * @param array<string, mixed> $wizard
     * @param mixed $answers
     * @return ValidationResult
     */
    public static function validateForSubmit(array $wizard, mixed $answers): ValidationResult
    {
        return self::validate($wizard, $answers, requireCompleted: true);
    }
}
