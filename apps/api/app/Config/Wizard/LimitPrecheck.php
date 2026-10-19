<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Cheap structural limit check that runs BEFORE walking anything.
 *
 * Walks only array lengths level by level and returns on the first violation.
 * Cost is bounded by the limits themselves, not by the input size (100k steps rejected in ms).
 *
 * Mirrors precheckLimits in packages/config-schema/src/wizard/precheck-limits.ts.
 */
final class LimitPrecheck
{
    /**
     * @return list<ConfigIssue>
     */
    public static function check(mixed $input): array
    {
        if (! is_array($input) || (count($input) > 0 && array_is_list($input))) {
            return [];
        }

        if (! isset($input['steps']) || ! is_array($input['steps'])) {
            return [];
        }

        $steps = $input['steps'];
        $stepCount = count($steps);
        if ($stepCount > WizardConstants::MAX_STEPS) {
            return [
                new ConfigIssue(
                    ['steps'],
                    ConfigIssueCode::LimitExceeded,
                    "Steps count {$stepCount} exceeds maximum " . WizardConstants::MAX_STEPS
                ),
            ];
        }

        $fieldTotal = 0;
        foreach ($steps as $stepIndex => $step) {
            if (! is_array($step) || ! isset($step['sections']) || ! is_array($step['sections'])) {
                continue;
            }

            $sections = $step['sections'];
            $sectionCount = count($sections);
            if ($sectionCount > WizardConstants::MAX_SECTIONS_PER_STEP) {
                return [
                    new ConfigIssue(
                        ['steps', $stepIndex, 'sections'],
                        ConfigIssueCode::LimitExceeded,
                        "Sections count {$sectionCount} exceeds maximum " . WizardConstants::MAX_SECTIONS_PER_STEP
                    ),
                ];
            }

            foreach ($sections as $sectionIndex => $section) {
                if (! is_array($section) || ! isset($section['fields']) || ! is_array($section['fields'])) {
                    continue;
                }

                $fields = $section['fields'];
                $fieldTotal += count($fields);
                if ($fieldTotal > WizardConstants::MAX_FIELDS_TOTAL) {
                    return [
                        new ConfigIssue(
                            ['steps', $stepIndex, 'sections', $sectionIndex, 'fields'],
                            ConfigIssueCode::LimitExceeded,
                            "Fields count {$fieldTotal} exceeds maximum " . WizardConstants::MAX_FIELDS_TOTAL
                        ),
                    ];
                }

                foreach ($fields as $fieldIndex => $field) {
                    if (is_array($field) && isset($field['options']) && is_array($field['options'])) {
                        $optCount = count($field['options']);
                        if ($optCount > WizardConstants::MAX_OPTIONS_PER_FIELD) {
                            return [
                                new ConfigIssue(
                                    ['steps', $stepIndex, 'sections', $sectionIndex, 'fields', $fieldIndex, 'options'],
                                    ConfigIssueCode::LimitExceeded,
                                    "Options count {$optCount} exceeds maximum " . WizardConstants::MAX_OPTIONS_PER_FIELD
                                ),
                            ];
                        }
                    }
                }
            }
        }

        return [];
    }
}
