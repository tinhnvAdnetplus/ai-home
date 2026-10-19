<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Cross-validates wizard configuration across fields, sections, steps, bindings, and condition graphs.
 *
 * Enforces:
 * - Duplicate key prevention across steps, sections, and fields
 * - Step and field count limits
 * - Reference integrity of variables in condition expressions
 * - Self-reference rejection
 * - Dependency cycle detection in conditions (DFS)
 * - Planner binding validation (existence, compatibility, uniqueness)
 * - Field semantics (options, defaultValue in options, numeric ranges, selection limits)
 *
 * Mirrors packages/config-schema/src/wizard/cross-validate.ts.
 */
final class CrossValidator
{
    /**
     * @param  array<string, mixed>  $config Normalized wizard configuration
     * @return list<ConfigIssue>
     */
    public static function validate(array $config): array
    {
        $issues = [];
        /** @var list<array<string, mixed>> $steps */
        $steps = $config['steps'] ?? [];
        $stepCount = count($steps);

        if ($stepCount > WizardConstants::MAX_STEPS) {
            $issues[] = new ConfigIssue(
                ['steps'],
                ConfigIssueCode::LimitExceeded,
                "Steps count {$stepCount} exceeds max " . WizardConstants::MAX_STEPS
            );
        }

        $allFieldKeys = [];
        $totalFields = 0;
        foreach ($steps as $step) {
            /** @var list<array<string, mixed>> $sections */
            $sections = $step['sections'] ?? [];
            foreach ($sections as $section) {
                /** @var list<array<string, mixed>> $fields */
                $fields = $section['fields'] ?? [];
                $totalFields += count($fields);
                foreach ($fields as $f) {
                    if (isset($f['key']) && is_string($f['key'])) {
                        $allFieldKeys[$f['key']] = true;
                    }
                }
            }
        }

        if ($totalFields > WizardConstants::MAX_FIELDS_TOTAL) {
            $issues[] = new ConfigIssue(
                ['steps'],
                ConfigIssueCode::LimitExceeded,
                "Total fields {$totalFields} exceeds max " . WizardConstants::MAX_FIELDS_TOTAL
            );
        }

        $seenStepKeys = [];
        $seenSectionKeys = [];
        $seenFieldKeys = [];
        $seenBindings = [];
        $fieldPaths = [];
        $dependencyGraph = [];

        foreach ($steps as $sIdx => $step) {
            $stepKey = (string) ($step['key'] ?? '');
            if (isset($seenStepKeys[$stepKey])) {
                $issues[] = new ConfigIssue(
                    ['steps', $sIdx, 'key'],
                    ConfigIssueCode::DuplicateKey,
                    "Duplicate step key: {$stepKey}"
                );
            } else {
                $seenStepKeys[$stepKey] = true;
            }

            /** @var list<array<string, mixed>> $sections */
            $sections = $step['sections'] ?? [];
            $sectionCount = count($sections);
            if ($sectionCount > WizardConstants::MAX_SECTIONS_PER_STEP) {
                $issues[] = new ConfigIssue(
                    ['steps', $sIdx, 'sections'],
                    ConfigIssueCode::LimitExceeded,
                    "Sections in step {$sIdx} exceeds max " . WizardConstants::MAX_SECTIONS_PER_STEP
                );
            }

            foreach ($sections as $secIdx => $section) {
                $secKey = (string) ($section['key'] ?? '');
                if (isset($seenSectionKeys[$secKey])) {
                    $issues[] = new ConfigIssue(
                        ['steps', $sIdx, 'sections', $secIdx, 'key'],
                        ConfigIssueCode::DuplicateKey,
                        "Duplicate section key: {$secKey}"
                    );
                } else {
                    $seenSectionKeys[$secKey] = true;
                }

                /** @var list<array<string, mixed>> $fields */
                $fields = $section['fields'] ?? [];
                foreach ($fields as $fIdx => $field) {
                    $fieldKey = (string) ($field['key'] ?? '');
                    $fPath = ['steps', $sIdx, 'sections', $secIdx, 'fields', $fIdx];
                    $fieldPaths[$fieldKey] = $fPath;

                    if (isset($seenFieldKeys[$fieldKey])) {
                        $issues[] = new ConfigIssue(
                            [...$fPath, 'key'],
                            ConfigIssueCode::DuplicateKey,
                            "Duplicate field key: {$fieldKey}"
                        );
                    } else {
                        $seenFieldKeys[$fieldKey] = true;
                    }

                    $bindingIssues = BindingValidator::validate($field, $fPath, $seenBindings);
                    foreach ($bindingIssues as $bi) {
                        $issues[] = $bi;
                    }

                    $fieldIssues = FieldValidator::validate($field, $fPath);
                    foreach ($fieldIssues as $fi) {
                        $issues[] = $fi;
                    }

                    self::checkFieldConditions($field, $fPath, $allFieldKeys, $dependencyGraph, $issues);
                }
            }
        }

        $cycleIssues = CycleDetector::detect($dependencyGraph, $fieldPaths);
        foreach ($cycleIssues as $ci) {
            $issues[] = $ci;
        }

        return $issues;
    }

    /**
     * @param  array<string, mixed>  $field
     * @param  list<string|int>  $fieldPath
     * @param  array<string, bool>  $allFieldKeys
     * @param  array<string, list<string>>  $dependencyGraph
     * @param  list<ConfigIssue>  $issues
     */
    private static function checkFieldConditions(
        array $field,
        array $fieldPath,
        array $allFieldKeys,
        array &$dependencyGraph,
        array &$issues
    ): void {
        $deps = [];
        $fieldKey = (string) ($field['key'] ?? '');

        $inspectCond = function (mixed $cond, string $condProp) use (
            $fieldKey,
            $fieldPath,
            $allFieldKeys,
            &$deps,
            &$issues
        ): void {
            if ($cond === null) {
                return;
            }

            $vars = ConditionVars::collect($cond);
            foreach ($vars as $v) {
                if ($v === $fieldKey) {
                    $issues[] = new ConfigIssue(
                        [...$fieldPath, $condProp],
                        ConfigIssueCode::SelfReference,
                        "Field '{$fieldKey}' references itself in {$condProp}"
                    );
                } elseif (! isset($allFieldKeys[$v])) {
                    $issues[] = new ConfigIssue(
                        [...$fieldPath, $condProp],
                        ConfigIssueCode::UnknownFieldRef,
                        "Condition references unknown field '{$v}'"
                    );
                } else {
                    $deps[] = $v;
                }
            }
        };

        if (array_key_exists('visibleWhen', $field)) {
            $inspectCond($field['visibleWhen'], 'visibleWhen');
        }

        if (array_key_exists('disabledWhen', $field)) {
            $inspectCond($field['disabledWhen'], 'disabledWhen');
        }

        if (isset($field['options']) && is_array($field['options'])) {
            foreach ($field['options'] as $optIdx => $opt) {
                if (is_array($opt) && array_key_exists('disabledWhen', $opt)) {
                    $inspectCond($opt['disabledWhen'], "options.{$optIdx}.disabledWhen");
                }
            }
        }

        $dependencyGraph[$fieldKey] = $deps;
    }
}
