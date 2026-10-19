<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Validates strict structural types and produces a normalized configuration array.
 *
 * Enforces:
 * - Strict objects (no unknown keys allowed at any level)
 * - Exact data types (no PHP type juggling: "1" !== 1, true !== 1, null !== missing)
 * - Distinct list vs object semantics
 * - Text normalization (Unicode character length checking, trimming)
 *
 * Mirrors packages/config-schema/src/wizard/wizard-schema.ts, field-schemas.ts, option-schema.ts.
 */
final class StructuralValidator
{
    /**
     * @return array{issues: list<ConfigIssue>, data: array<string, mixed>|null}
     */
    public static function validateAndNormalize(mixed $input): array
    {
        $issues = [];

        if (! is_array($input) || (count($input) > 0 && array_is_list($input))) {
            return [
                'issues' => [new ConfigIssue([], ConfigIssueCode::SchemaInvalid, 'Expected object at root')],
                'data' => null,
            ];
        }

        self::checkStrictObject($input, ['schemaVersion', 'steps'], [], $issues);

        if (! array_key_exists('schemaVersion', $input)) {
            $issues[] = new ConfigIssue(['schemaVersion'], ConfigIssueCode::SchemaInvalid, 'Required');
        } elseif (! WizardNumbers::isIntegral($input['schemaVersion']) || (int) $input['schemaVersion'] !== 1) {
            $issues[] = new ConfigIssue(
                ['schemaVersion'],
                ConfigIssueCode::SchemaInvalid,
                'Expected 1, received ' . json_encode($input['schemaVersion'])
            );
        }

        if (! array_key_exists('steps', $input)) {
            $issues[] = new ConfigIssue(['steps'], ConfigIssueCode::SchemaInvalid, 'Required');
        } elseif (! is_array($input['steps']) || ! array_is_list($input['steps'])) {
            $issues[] = new ConfigIssue(['steps'], ConfigIssueCode::SchemaInvalid, 'Expected array');
        }

        $normalizedSteps = [];
        if (isset($input['steps']) && is_array($input['steps']) && array_is_list($input['steps'])) {
            foreach ($input['steps'] as $sIdx => $step) {
                $normStep = self::validateStep($step, ['steps', $sIdx], $issues);
                if ($normStep !== null) {
                    $normalizedSteps[] = $normStep;
                }
            }
        }

        if (! empty($issues)) {
            return ['issues' => $issues, 'data' => null];
        }

        return [
            'issues' => [],
            'data' => [
                'schemaVersion' => 1,
                'steps' => $normalizedSteps,
            ],
        ];
    }

    /**
     * @param  list<string>  $allowedKeys
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     */
    private static function checkStrictObject(mixed $val, array $allowedKeys, array $path, array &$issues): bool
    {
        if (! is_array($val) || (count($val) > 0 && array_is_list($val))) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected object');

            return false;
        }

        $allowedLookup = array_flip($allowedKeys);
        foreach ($val as $k => $_) {
            $keyStr = (string) $k;
            if (! isset($allowedLookup[$keyStr])) {
                $issues[] = new ConfigIssue(
                    [...$path, $keyStr],
                    ConfigIssueCode::SchemaInvalid,
                    "Unrecognized key(s) in object: '{$keyStr}'"
                );
            }
        }

        return true;
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     * @return array<string, mixed>|null
     */
    private static function validateStep(mixed $step, array $path, array &$issues): ?array
    {
        if (! is_array($step) || (count($step) > 0 && array_is_list($step))) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected step object');

            return null;
        }

        self::checkStrictObject($step, ['key', 'title', 'subtitle', 'icon', 'sections'], $path, $issues);

        self::validateKey($step['key'] ?? null, [...$path, 'key'], $issues);
        $title = self::validateLocalizedText($step['title'] ?? null, [...$path, 'title'], $issues);

        $subtitle = null;
        if (array_key_exists('subtitle', $step)) {
            $subtitle = self::validateLocalizedText($step['subtitle'], [...$path, 'subtitle'], $issues);
        }

        $icon = null;
        if (array_key_exists('icon', $step)) {
            if (! is_string($step['icon']) || ! in_array($step['icon'], WizardConstants::STEP_ICONS, true)) {
                $issues[] = new ConfigIssue(
                    [...$path, 'icon'],
                    ConfigIssueCode::SchemaInvalid,
                    'Invalid step icon: ' . json_encode($step['icon'])
                );
            } else {
                $icon = $step['icon'];
            }
        }

        if (! array_key_exists('sections', $step)) {
            $issues[] = new ConfigIssue([...$path, 'sections'], ConfigIssueCode::SchemaInvalid, 'Required');
        } elseif (! is_array($step['sections']) || ! array_is_list($step['sections'])) {
            $issues[] = new ConfigIssue([...$path, 'sections'], ConfigIssueCode::SchemaInvalid, 'Expected array of sections');
        }

        $normalizedSections = [];
        if (isset($step['sections']) && is_array($step['sections']) && array_is_list($step['sections'])) {
            foreach ($step['sections'] as $secIdx => $sec) {
                $normSec = self::validateSection($sec, [...$path, 'sections', $secIdx], $issues);
                if ($normSec !== null) {
                    $normalizedSections[] = $normSec;
                }
            }
        }

        $normalized = [
            'key' => (string) ($step['key'] ?? ''),
            'title' => $title ?? ['ja' => ''],
            'sections' => $normalizedSections,
        ];

        if ($subtitle !== null) {
            $normalized['subtitle'] = $subtitle;
        }
        if ($icon !== null) {
            $normalized['icon'] = $icon;
        }

        return $normalized;
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     * @return array<string, mixed>|null
     */
    private static function validateSection(mixed $section, array $path, array &$issues): ?array
    {
        if (! is_array($section) || (count($section) > 0 && array_is_list($section))) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected section object');

            return null;
        }

        self::checkStrictObject($section, ['key', 'title', 'description', 'fields'], $path, $issues);

        self::validateKey($section['key'] ?? null, [...$path, 'key'], $issues);
        $title = self::validateLocalizedText($section['title'] ?? null, [...$path, 'title'], $issues);

        $description = null;
        if (array_key_exists('description', $section)) {
            $description = self::validateLocalizedText($section['description'], [...$path, 'description'], $issues);
        }

        if (! array_key_exists('fields', $section)) {
            $issues[] = new ConfigIssue([...$path, 'fields'], ConfigIssueCode::SchemaInvalid, 'Required');
        } elseif (! is_array($section['fields']) || ! array_is_list($section['fields'])) {
            $issues[] = new ConfigIssue([...$path, 'fields'], ConfigIssueCode::SchemaInvalid, 'Expected array of fields');
        }

        $normalizedFields = [];
        if (isset($section['fields']) && is_array($section['fields']) && array_is_list($section['fields'])) {
            foreach ($section['fields'] as $fIdx => $field) {
                $normField = self::validateField($field, [...$path, 'fields', $fIdx], $issues);
                if ($normField !== null) {
                    $normalizedFields[] = $normField;
                }
            }
        }

        $normalized = [
            'key' => (string) ($section['key'] ?? ''),
            'title' => $title ?? ['ja' => ''],
            'fields' => $normalizedFields,
        ];

        if ($description !== null) {
            $normalized['description'] = $description;
        }

        return $normalized;
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     * @return array<string, mixed>|null
     */
    private static function validateField(mixed $field, array $path, array &$issues): ?array
    {
        if (! is_array($field) || (count($field) > 0 && array_is_list($field))) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected field object');

            return null;
        }

        $type = $field['type'] ?? null;
        if (! is_string($type)) {
            $issues[] = new ConfigIssue([...$path, 'type'], ConfigIssueCode::SchemaInvalid, 'Required field type');

            return null;
        }

        $baseKeys = ['key', 'type', 'label', 'help', 'required', 'visibleWhen', 'disabledWhen', 'binding', 'summaryLabel'];
        $typeKeys = match ($type) {
            'text' => ['maxLength', 'placeholder', 'defaultValue'],
            'textarea' => ['maxLength', 'showCounter', 'placeholder', 'defaultValue'],
            'number' => ['min', 'max', 'step', 'unit', 'allowedUnits', 'defaultValue'],
            'range' => ['min', 'max', 'step', 'unit', 'defaultValue'],
            'select' => ['options', 'placeholder', 'defaultValue'],
            'radio' => ['options', 'defaultValue'],
            'checkbox_group' => ['options', 'minSelected', 'maxSelected', 'defaultValue'],
            'image_select' => ['options', 'multiple', 'minSelected', 'maxSelected', 'defaultValue'],
            'boolean' => ['defaultValue'],
            'upload' => ['accept', 'maxFiles', 'maxSizeMb'],
            default => null,
        };

        if ($typeKeys === null) {
            $issues[] = new ConfigIssue([...$path, 'type'], ConfigIssueCode::SchemaInvalid, "Invalid field type '{$type}'");

            return null;
        }

        self::checkStrictObject($field, array_merge($baseKeys, $typeKeys), $path, $issues);

        self::validateKey($field['key'] ?? null, [...$path, 'key'], $issues);
        $label = self::validateLocalizedText($field['label'] ?? null, [...$path, 'label'], $issues);

        $help = null;
        if (array_key_exists('help', $field)) {
            $help = self::validateLocalizedText($field['help'], [...$path, 'help'], $issues);
        }

        $required = false;
        if (array_key_exists('required', $field)) {
            if (! is_bool($field['required'])) {
                $issues[] = new ConfigIssue([...$path, 'required'], ConfigIssueCode::SchemaInvalid, 'Expected boolean');
            } else {
                $required = $field['required'];
            }
        }

        $visibleWhen = null;
        if (array_key_exists('visibleWhen', $field)) {
            $vIssues = ConditionAstValidator::validate($field['visibleWhen'], [...$path, 'visibleWhen']);
            foreach ($vIssues as $vi) {
                $issues[] = $vi;
            }
            $visibleWhen = $field['visibleWhen'];
        }

        $disabledWhen = null;
        if (array_key_exists('disabledWhen', $field)) {
            $dIssues = ConditionAstValidator::validate($field['disabledWhen'], [...$path, 'disabledWhen']);
            foreach ($dIssues as $di) {
                $issues[] = $di;
            }
            $disabledWhen = $field['disabledWhen'];
        }

        $binding = null;
        if (array_key_exists('binding', $field)) {
            self::validateBindingKey($field['binding'], [...$path, 'binding'], $issues);
            if (is_string($field['binding'])) {
                $binding = $field['binding'];
            }
        }

        $summaryLabel = null;
        if (array_key_exists('summaryLabel', $field)) {
            $summaryLabel = self::validateLocalizedText($field['summaryLabel'], [...$path, 'summaryLabel'], $issues);
        }

        $normalized = [
            'key' => (string) ($field['key'] ?? ''),
            'type' => $type,
            'label' => $label ?? ['ja' => ''],
            'required' => $required,
        ];

        if ($help !== null) {
            $normalized['help'] = $help;
        }
        if ($visibleWhen !== null) {
            $normalized['visibleWhen'] = $visibleWhen;
        }
        if ($disabledWhen !== null) {
            $normalized['disabledWhen'] = $disabledWhen;
        }
        if ($binding !== null) {
            $normalized['binding'] = $binding;
        }
        if ($summaryLabel !== null) {
            $normalized['summaryLabel'] = $summaryLabel;
        }

        // Type specific validation
        self::validateTypeSpecificField($field, $type, $path, $normalized, $issues);

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  list<string|int>  $path
     * @param  array<string, mixed>  $normalized
     * @param  list<ConfigIssue>  $issues
     */
    private static function validateTypeSpecificField(
        array $field,
        string $type,
        array $path,
        array &$normalized,
        array &$issues
    ): void {
        switch ($type) {
            case 'text':
                if (array_key_exists('maxLength', $field)) {
                    if (! WizardNumbers::isIntegral($field['maxLength']) || $field['maxLength'] < 1 || $field['maxLength'] > WizardConstants::MAX_TEXT_LENGTH) {
                        $issues[] = new ConfigIssue([...$path, 'maxLength'], ConfigIssueCode::SchemaInvalid, 'maxLength must be between 1 and ' . WizardConstants::MAX_TEXT_LENGTH);
                    } else {
                        $normalized['maxLength'] = $field['maxLength'];
                    }
                }
                if (array_key_exists('placeholder', $field)) {
                    $normalized['placeholder'] = self::validateLocalizedText($field['placeholder'], [...$path, 'placeholder'], $issues);
                }
                if (array_key_exists('defaultValue', $field)) {
                    if (! is_string($field['defaultValue'])) {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected string defaultValue');
                    } else {
                        $normalized['defaultValue'] = $field['defaultValue'];
                    }
                }
                break;

            case 'textarea':
                if (array_key_exists('maxLength', $field)) {
                    if (! WizardNumbers::isIntegral($field['maxLength']) || $field['maxLength'] < 1 || $field['maxLength'] > WizardConstants::MAX_TEXTAREA_LENGTH) {
                        $issues[] = new ConfigIssue([...$path, 'maxLength'], ConfigIssueCode::SchemaInvalid, 'maxLength must be between 1 and ' . WizardConstants::MAX_TEXTAREA_LENGTH);
                    } else {
                        $normalized['maxLength'] = $field['maxLength'];
                    }
                }
                if (array_key_exists('showCounter', $field)) {
                    if (! is_bool($field['showCounter'])) {
                        $issues[] = new ConfigIssue([...$path, 'showCounter'], ConfigIssueCode::SchemaInvalid, 'Expected boolean');
                    } else {
                        $normalized['showCounter'] = $field['showCounter'];
                    }
                }
                if (array_key_exists('placeholder', $field)) {
                    $normalized['placeholder'] = self::validateLocalizedText($field['placeholder'], [...$path, 'placeholder'], $issues);
                }
                if (array_key_exists('defaultValue', $field)) {
                    if (! is_string($field['defaultValue'])) {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected string defaultValue');
                    } else {
                        $normalized['defaultValue'] = $field['defaultValue'];
                    }
                }
                break;

            case 'number':
                if (array_key_exists('min', $field)) {
                    if (! self::isNumeric($field['min'])) {
                        $issues[] = new ConfigIssue([...$path, 'min'], ConfigIssueCode::SchemaInvalid, 'Expected finite number');
                    } else {
                        $normalized['min'] = $field['min'];
                    }
                }
                if (array_key_exists('max', $field)) {
                    if (! self::isNumeric($field['max'])) {
                        $issues[] = new ConfigIssue([...$path, 'max'], ConfigIssueCode::SchemaInvalid, 'Expected finite number');
                    } else {
                        $normalized['max'] = $field['max'];
                    }
                }
                if (array_key_exists('step', $field)) {
                    if (! self::isNumeric($field['step']) || $field['step'] <= 0) {
                        $issues[] = new ConfigIssue([...$path, 'step'], ConfigIssueCode::SchemaInvalid, 'Expected positive finite number');
                    } else {
                        $normalized['step'] = $field['step'];
                    }
                }
                if (array_key_exists('unit', $field)) {
                    if (! is_string($field['unit'])) {
                        $issues[] = new ConfigIssue([...$path, 'unit'], ConfigIssueCode::SchemaInvalid, 'Expected string unit');
                    } else {
                        $normalized['unit'] = $field['unit'];
                    }
                }
                if (array_key_exists('allowedUnits', $field)) {
                    if (! is_array($field['allowedUnits']) || ! array_is_list($field['allowedUnits'])) {
                        $issues[] = new ConfigIssue([...$path, 'allowedUnits'], ConfigIssueCode::SchemaInvalid, 'Expected array of string units');
                    } else {
                        foreach ($field['allowedUnits'] as $uIdx => $u) {
                            if (! is_string($u)) {
                                $issues[] = new ConfigIssue([...$path, 'allowedUnits', $uIdx], ConfigIssueCode::SchemaInvalid, 'Expected string unit');
                            }
                        }
                        $normalized['allowedUnits'] = $field['allowedUnits'];
                    }
                }
                if (array_key_exists('defaultValue', $field)) {
                    if (! self::isNumeric($field['defaultValue'])) {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected finite number defaultValue');
                    } else {
                        $normalized['defaultValue'] = $field['defaultValue'];
                    }
                }
                break;

            case 'range':
                foreach (['min', 'max', 'step'] as $reqProp) {
                    if (! array_key_exists($reqProp, $field)) {
                        $issues[] = new ConfigIssue([...$path, $reqProp], ConfigIssueCode::SchemaInvalid, 'Required');
                    }
                }
                if (array_key_exists('min', $field)) {
                    if (! self::isNumeric($field['min'])) {
                        $issues[] = new ConfigIssue([...$path, 'min'], ConfigIssueCode::SchemaInvalid, 'Expected finite number');
                    } else {
                        $normalized['min'] = $field['min'];
                    }
                }
                if (array_key_exists('max', $field)) {
                    if (! self::isNumeric($field['max'])) {
                        $issues[] = new ConfigIssue([...$path, 'max'], ConfigIssueCode::SchemaInvalid, 'Expected finite number');
                    } else {
                        $normalized['max'] = $field['max'];
                    }
                }
                if (array_key_exists('step', $field)) {
                    if (! self::isNumeric($field['step']) || $field['step'] <= 0) {
                        $issues[] = new ConfigIssue([...$path, 'step'], ConfigIssueCode::SchemaInvalid, 'Expected positive finite number');
                    } else {
                        $normalized['step'] = $field['step'];
                    }
                }
                if (array_key_exists('unit', $field)) {
                    if (! is_string($field['unit'])) {
                        $issues[] = new ConfigIssue([...$path, 'unit'], ConfigIssueCode::SchemaInvalid, 'Expected string unit');
                    } else {
                        $normalized['unit'] = $field['unit'];
                    }
                }
                if (array_key_exists('defaultValue', $field)) {
                    if (! self::isNumeric($field['defaultValue'])) {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected finite number defaultValue');
                    } else {
                        $normalized['defaultValue'] = $field['defaultValue'];
                    }
                }
                break;

            case 'select':
                $normalized['options'] = self::validateOptions($field['options'] ?? null, false, [...$path, 'options'], $issues);
                if (array_key_exists('placeholder', $field)) {
                    $normalized['placeholder'] = self::validateLocalizedText($field['placeholder'], [...$path, 'placeholder'], $issues);
                }
                if (array_key_exists('defaultValue', $field)) {
                    if (! is_string($field['defaultValue'])) {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected string defaultValue');
                    } else {
                        $normalized['defaultValue'] = $field['defaultValue'];
                    }
                }
                break;

            case 'radio':
                $normalized['options'] = self::validateOptions($field['options'] ?? null, false, [...$path, 'options'], $issues);
                if (array_key_exists('defaultValue', $field)) {
                    if (! is_string($field['defaultValue'])) {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected string defaultValue');
                    } else {
                        $normalized['defaultValue'] = $field['defaultValue'];
                    }
                }
                break;

            case 'checkbox_group':
                $normalized['options'] = self::validateOptions($field['options'] ?? null, false, [...$path, 'options'], $issues);
                if (array_key_exists('minSelected', $field)) {
                    if (! WizardNumbers::isIntegral($field['minSelected']) || $field['minSelected'] < 0) {
                        $issues[] = new ConfigIssue([...$path, 'minSelected'], ConfigIssueCode::SchemaInvalid, 'minSelected must be integer >= 0');
                    } else {
                        $normalized['minSelected'] = $field['minSelected'];
                    }
                }
                if (array_key_exists('maxSelected', $field)) {
                    if (! WizardNumbers::isIntegral($field['maxSelected']) || $field['maxSelected'] < 1) {
                        $issues[] = new ConfigIssue([...$path, 'maxSelected'], ConfigIssueCode::SchemaInvalid, 'maxSelected must be integer >= 1');
                    } else {
                        $normalized['maxSelected'] = $field['maxSelected'];
                    }
                }
                if (array_key_exists('defaultValue', $field)) {
                    if (! is_array($field['defaultValue']) || ! array_is_list($field['defaultValue'])) {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected array of string defaultValue');
                    } else {
                        foreach ($field['defaultValue'] as $dIdx => $dVal) {
                            if (! is_string($dVal)) {
                                $issues[] = new ConfigIssue([...$path, 'defaultValue', $dIdx], ConfigIssueCode::SchemaInvalid, 'Expected string');
                            }
                        }
                        $normalized['defaultValue'] = $field['defaultValue'];
                    }
                }
                break;

            case 'image_select':
                $normalized['options'] = self::validateOptions($field['options'] ?? null, true, [...$path, 'options'], $issues);
                $multiple = false;
                if (array_key_exists('multiple', $field)) {
                    if (! is_bool($field['multiple'])) {
                        $issues[] = new ConfigIssue([...$path, 'multiple'], ConfigIssueCode::SchemaInvalid, 'Expected boolean multiple');
                    } else {
                        $multiple = $field['multiple'];
                    }
                }
                $normalized['multiple'] = $multiple;

                if (array_key_exists('minSelected', $field)) {
                    if (! WizardNumbers::isIntegral($field['minSelected']) || $field['minSelected'] < 0) {
                        $issues[] = new ConfigIssue([...$path, 'minSelected'], ConfigIssueCode::SchemaInvalid, 'minSelected must be integer >= 0');
                    } else {
                        $normalized['minSelected'] = $field['minSelected'];
                    }
                }
                if (array_key_exists('maxSelected', $field)) {
                    if (! WizardNumbers::isIntegral($field['maxSelected']) || $field['maxSelected'] < 1) {
                        $issues[] = new ConfigIssue([...$path, 'maxSelected'], ConfigIssueCode::SchemaInvalid, 'maxSelected must be integer >= 1');
                    } else {
                        $normalized['maxSelected'] = $field['maxSelected'];
                    }
                }
                if (array_key_exists('defaultValue', $field)) {
                    $dVal = $field['defaultValue'];
                    if (is_string($dVal)) {
                        $normalized['defaultValue'] = $dVal;
                    } elseif (is_array($dVal) && array_is_list($dVal)) {
                        foreach ($dVal as $dIdx => $item) {
                            if (! is_string($item)) {
                                $issues[] = new ConfigIssue([...$path, 'defaultValue', $dIdx], ConfigIssueCode::SchemaInvalid, 'Expected string');
                            }
                        }
                        $normalized['defaultValue'] = $dVal;
                    } else {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected string or array of strings defaultValue');
                    }
                }
                break;

            case 'boolean':
                if (array_key_exists('defaultValue', $field)) {
                    if (! is_bool($field['defaultValue'])) {
                        $issues[] = new ConfigIssue([...$path, 'defaultValue'], ConfigIssueCode::SchemaInvalid, 'Expected boolean defaultValue');
                    } else {
                        $normalized['defaultValue'] = $field['defaultValue'];
                    }
                }
                break;

            case 'upload':
                if (! array_key_exists('accept', $field)) {
                    $issues[] = new ConfigIssue([...$path, 'accept'], ConfigIssueCode::SchemaInvalid, 'Required');
                } elseif (! is_array($field['accept']) || ! array_is_list($field['accept'])) {
                    $issues[] = new ConfigIssue([...$path, 'accept'], ConfigIssueCode::SchemaInvalid, 'Expected array of MIME types');
                } else {
                    foreach ($field['accept'] as $mIdx => $mime) {
                        if (! is_string($mime) || ! in_array($mime, WizardConstants::UPLOAD_MIME_TYPES, true)) {
                            $issues[] = new ConfigIssue([...$path, 'accept', $mIdx], ConfigIssueCode::SchemaInvalid, 'Invalid MIME type: ' . json_encode($mime));
                        }
                    }
                    $normalized['accept'] = $field['accept'];
                }

                if (! array_key_exists('maxFiles', $field)) {
                    $issues[] = new ConfigIssue([...$path, 'maxFiles'], ConfigIssueCode::SchemaInvalid, 'Required');
                } elseif (! WizardNumbers::isIntegral($field['maxFiles']) || $field['maxFiles'] < 1 || $field['maxFiles'] > WizardConstants::MAX_UPLOAD_FILES) {
                    $issues[] = new ConfigIssue([...$path, 'maxFiles'], ConfigIssueCode::SchemaInvalid, 'maxFiles must be integer between 1 and ' . WizardConstants::MAX_UPLOAD_FILES);
                } else {
                    $normalized['maxFiles'] = $field['maxFiles'];
                }

                if (! array_key_exists('maxSizeMb', $field)) {
                    $issues[] = new ConfigIssue([...$path, 'maxSizeMb'], ConfigIssueCode::SchemaInvalid, 'Required');
                } elseif (! WizardNumbers::isIntegral($field['maxSizeMb']) || $field['maxSizeMb'] < 1 || $field['maxSizeMb'] > WizardConstants::MAX_UPLOAD_SIZE_MB) {
                    $issues[] = new ConfigIssue([...$path, 'maxSizeMb'], ConfigIssueCode::SchemaInvalid, 'maxSizeMb must be integer between 1 and ' . WizardConstants::MAX_UPLOAD_SIZE_MB);
                } else {
                    $normalized['maxSizeMb'] = $field['maxSizeMb'];
                }
                break;
        }
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     * @return list<array<string, mixed>>
     */
    private static function validateOptions(mixed $options, bool $requiresImage, array $path, array &$issues): array
    {
        if (! is_array($options) || ! array_is_list($options)) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected array of options');

            return [];
        }

        $normalized = [];
        foreach ($options as $optIdx => $opt) {
            $optPath = [...$path, $optIdx];
            if (! is_array($opt) || (count($opt) > 0 && array_is_list($opt))) {
                $issues[] = new ConfigIssue($optPath, ConfigIssueCode::SchemaInvalid, 'Expected option object');
                continue;
            }

            self::checkStrictObject($opt, ['value', 'label', 'description', 'image', 'disabledWhen'], $optPath, $issues);

            self::validateKey($opt['value'] ?? null, [...$optPath, 'value'], $issues);
            $optLabel = self::validateLocalizedText($opt['label'] ?? null, [...$optPath, 'label'], $issues);

            $optDesc = null;
            if (array_key_exists('description', $opt)) {
                $optDesc = self::validateLocalizedText($opt['description'], [...$optPath, 'description'], $issues);
            }

            $optImage = null;
            if ($requiresImage) {
                if (! array_key_exists('image', $opt)) {
                    $issues[] = new ConfigIssue([...$optPath, 'image'], ConfigIssueCode::SchemaInvalid, 'Required image');
                } else {
                    $optImage = self::validateMediaRef($opt['image'], [...$optPath, 'image'], $issues);
                }
            } elseif (array_key_exists('image', $opt)) {
                $optImage = self::validateMediaRef($opt['image'], [...$optPath, 'image'], $issues);
            }

            $optDisabledWhen = null;
            if (array_key_exists('disabledWhen', $opt)) {
                $dIssues = ConditionAstValidator::validate($opt['disabledWhen'], [...$optPath, 'disabledWhen']);
                foreach ($dIssues as $di) {
                    $issues[] = $di;
                }
                $optDisabledWhen = $opt['disabledWhen'];
            }

            $norm = [
                'value' => (string) ($opt['value'] ?? ''),
                'label' => $optLabel ?? ['ja' => ''],
            ];
            if ($optDesc !== null) {
                $norm['description'] = $optDesc;
            }
            if ($optImage !== null) {
                $norm['image'] = $optImage;
            }
            if ($optDisabledWhen !== null) {
                $norm['disabledWhen'] = $optDisabledWhen;
            }

            $normalized[] = $norm;
        }

        return $normalized;
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     * @return array{mediaId: string, alt: array<string, string>}|null
     */
    private static function validateMediaRef(mixed $val, array $path, array &$issues): ?array
    {
        if (! is_array($val) || (count($val) > 0 && array_is_list($val))) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected mediaRef object');

            return null;
        }

        self::checkStrictObject($val, ['mediaId', 'alt'], $path, $issues);

        if (! array_key_exists('mediaId', $val)) {
            $issues[] = new ConfigIssue([...$path, 'mediaId'], ConfigIssueCode::SchemaInvalid, 'Required mediaId');
        } elseif (! is_string($val['mediaId']) || preg_match(WizardConstants::MEDIA_ID_REGEX, $val['mediaId']) !== 1) {
            $issues[] = new ConfigIssue(
                [...$path, 'mediaId'],
                ConfigIssueCode::SchemaInvalid,
                'mediaId must be 1-64 characters matching [A-Za-z0-9_-]'
            );
        }

        $alt = self::validateLocalizedText($val['alt'] ?? null, [...$path, 'alt'], $issues);

        return [
            'mediaId' => (string) ($val['mediaId'] ?? ''),
            'alt' => $alt ?? ['ja' => ''],
        ];
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     * @return array<string, string>|null
     */
    private static function validateLocalizedText(mixed $val, array $path, array &$issues): ?array
    {
        if (! is_array($val) || (count($val) > 0 && array_is_list($val))) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected localizedText object');

            return null;
        }

        self::checkStrictObject($val, ['ja', 'en', 'vi'], $path, $issues);

        if (! array_key_exists('ja', $val)) {
            $issues[] = new ConfigIssue([...$path, 'ja'], ConfigIssueCode::SchemaInvalid, 'Required Japanese text');
        }

        $normalized = [];
        foreach (['ja', 'en', 'vi'] as $lang) {
            if (array_key_exists($lang, $val)) {
                $raw = $val[$lang];
                if (! is_string($raw)) {
                    $issues[] = new ConfigIssue([...$path, $lang], ConfigIssueCode::SchemaInvalid, 'Expected string');
                } else {
                    $trimmed = trim($raw);
                    $len = mb_strlen($trimmed, 'UTF-8');
                    if ($len < 1 || $len > WizardConstants::MAX_LOCALIZED_TEXT_LENGTH) {
                        $issues[] = new ConfigIssue(
                            [...$path, $lang],
                            ConfigIssueCode::SchemaInvalid,
                            'String must contain at least 1 and at most ' . WizardConstants::MAX_LOCALIZED_TEXT_LENGTH . ' character(s)'
                        );
                    }
                    $normalized[$lang] = $trimmed;
                }
            }
        }

        return $normalized;
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     */
    private static function validateKey(mixed $val, array $path, array &$issues): void
    {
        if (! is_string($val)) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected string key');

            return;
        }

        if (preg_match(WizardConstants::KEY_REGEX, $val) !== 1) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                'Key must match ^[a-z][a-z0-9_]{0,47}$ (1-48 lowercase letters, numbers, underscores)'
            );
        } elseif (in_array(strtolower($val), WizardConstants::DENIED_KEYS, true)) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                'Key is in the forbidden prototype pollution deny-list'
            );
        }
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     */
    private static function validateBindingKey(mixed $val, array $path, array &$issues): void
    {
        if (! is_string($val)) {
            $issues[] = new ConfigIssue($path, ConfigIssueCode::SchemaInvalid, 'Expected string binding key');

            return;
        }

        if (strlen($val) > WizardConstants::MAX_BINDING_KEY_LENGTH) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                'Binding key must be at most ' . WizardConstants::MAX_BINDING_KEY_LENGTH . ' characters'
            );
        }

        if (preg_match(WizardConstants::BINDING_KEY_REGEX, $val) !== 1) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                'Binding key must match dot.case ^[a-z][a-zA-Z0-9]*(\\.[a-z][a-zA-Z0-9]*)*$'
            );
        }
    }

    private static function isNumeric(mixed $val): bool
    {
        return (is_int($val) || is_float($val)) && is_finite($val);
    }
}
