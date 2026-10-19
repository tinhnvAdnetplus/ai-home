<?php

declare(strict_types=1);

namespace App\Config\Wizard;

use Throwable;

/**
 * Server-side evaluation of wizard conditions and answers resolution.
 *
 * Direct PHP port of packages/config-schema/src/wizard-state.ts and condition-evaluator.ts.
 * Guarantees bounded cost, strict types, never throws, and no PHP type juggling.
 */
final class AnswerResolver
{
    /**
     * Collect all field definitions from a wizard configuration.
     *
     * @param array<string, mixed> $wizard
     * @return list<array<string, mixed>>
     */
    public static function collectFields(array $wizard): array
    {
        $fields = [];
        $steps = $wizard['steps'] ?? [];
        if (!is_array($steps)) {
            return $fields;
        }

        foreach ($steps as $step) {
            if (!is_array($step)) {
                continue;
            }
            $sections = $step['sections'] ?? [];
            if (!is_array($sections)) {
                continue;
            }
            foreach ($sections as $section) {
                if (!is_array($section)) {
                    continue;
                }
                $secFields = $section['fields'] ?? [];
                if (!is_array($secFields)) {
                    continue;
                }
                foreach ($secFields as $field) {
                    if (is_array($field) && isset($field['key']) && is_string($field['key'])) {
                        $fields[] = $field;
                    }
                }
            }
        }

        return $fields;
    }

    /**
     * Normalize an arbitrary answer value.
     *
     * Port of normalizeAnswer() in packages/config-schema/src/answer-normalize.ts.
     */
    public static function normalizeAnswer(mixed $value): mixed
    {
        if ($value === null) {
            return null;
        }

        if (is_bool($value)) {
            return $value;
        }

        if (is_int($value)) {
            return $value;
        }

        if (is_float($value)) {
            return is_finite($value) ? $value : null;
        }

        if (is_string($value)) {
            return mb_strlen($value, 'UTF-8') <= 2000 ? $value : null;
        }

        if (is_array($value)) {
            if (!array_is_list($value) || count($value) > 100) {
                return null;
            }
            $sanitized = [];
            foreach ($value as $item) {
                if (!is_string($item) || mb_strlen($item, 'UTF-8') > 2000) {
                    return null;
                }
                $sanitized[] = $item;
            }

            return $sanitized;
        }

        return null;
    }

    /**
     * Evaluate truthiness according to condition DSL semantics.
     *
     * Port of isTruthy() in packages/config-schema/src/answer-normalize.ts.
     */
    public static function isTruthy(mixed $value): bool
    {
        if ($value === false || $value === null) {
            return false;
        }

        if (is_int($value)) {
            return $value !== 0;
        }

        if (is_float($value)) {
            return $value !== 0.0 && is_finite($value);
        }

        if (is_string($value)) {
            return $value !== '';
        }

        if (is_array($value)) {
            return count($value) > 0;
        }

        return true;
    }

    /**
     * Strict structural equality without PHP type juggling.
     *
     * Port of isStrictEqual() in packages/config-schema/src/answer-normalize.ts.
     */
    public static function isStrictEqual(mixed $left, mixed $right): bool
    {
        $isLeftArray = is_array($left);
        $isRightArray = is_array($right);

        if ($isLeftArray && $isRightArray) {
            if (count($left) !== count($right)) {
                return false;
            }
            $leftValues = array_values($left);
            $rightValues = array_values($right);
            $count = count($leftValues);
            for ($i = 0; $i < $count; $i++) {
                if (!self::isStrictEqual($leftValues[$i], $rightValues[$i])) {
                    return false;
                }
            }

            return true;
        }

        if ($isLeftArray || $isRightArray) {
            return false;
        }

        if ((is_int($left) || is_float($left)) && (is_int($right) || is_float($right))) {
            if (!is_finite((float) $left) || !is_finite((float) $right)) {
                return false;
            }

            return (float) $left === (float) $right;
        }

        return $left === $right;
    }

    /**
     * Read a variable from answers, safely normalized.
     */
    public static function readVar(mixed $answers, string $key): mixed
    {
        if (!is_array($answers)) {
            return null;
        }

        if (!array_key_exists($key, $answers)) {
            return null;
        }

        return self::normalizeAnswer($answers[$key]);
    }

    /**
     * Numerical comparison without type juggling.
     */
    public static function compareNumbers(mixed $left, mixed $right, string $op): bool
    {
        if ((!is_int($left) && !is_float($left)) || !is_finite((float) $left)) {
            return false;
        }

        if ((!is_int($right) && !is_float($right)) || !is_finite((float) $right)) {
            return false;
        }

        $l = (float) $left;
        $r = (float) $right;

        return match ($op) {
            '<' => $l < $r,
            '<=' => $l <= $r,
            '>' => $l > $r,
            '>=' => $l >= $r,
            default => false,
        };
    }

    /**
     * Binary operator evaluation.
     */
    public static function evaluateBinaryOp(mixed $left, mixed $right, string $op): bool
    {
        return match ($op) {
            '==' => self::isStrictEqual($left, $right),
            '!=' => !self::isStrictEqual($left, $right),
            '<' => self::compareNumbers($left, $right, '<'),
            '<=' => self::compareNumbers($left, $right, '<='),
            '>' => self::compareNumbers($left, $right, '>'),
            '>=' => self::compareNumbers($left, $right, '>='),
            default => false,
        };
    }

    /**
     * Evaluate 'in' operator: needle in haystack (array or variable).
     *
     * @param array<string, mixed> $answers
     */
    public static function evalIn(mixed $needle, mixed $haystackNode, array $answers): bool
    {
        if (is_array($haystackNode) && isset($haystackNode['var']) && is_string($haystackNode['var'])) {
            $haystack = self::readVar($answers, $haystackNode['var']);
            if (!is_array($haystack)) {
                return false;
            }
            foreach ($haystack as $item) {
                if (self::isStrictEqual($item, $needle)) {
                    return true;
                }
            }

            return false;
        }

        if (is_array($haystackNode)) {
            foreach ($haystackNode as $item) {
                if (self::isStrictEqual($item, $needle)) {
                    return true;
                }
            }

            return false;
        }

        return false;
    }

    /**
     * Evaluate a condition node AST recursively with strict limits.
     *
     * @param array<string, mixed> $answers
     */
    public static function evaluateCondition(mixed $condition, array $answers): bool
    {
        try {
            $state = new ConditionEvalState();

            $result = self::evalNode($condition, $answers, 1, $state);
            if ($state->hasExceededLimits) {
                return false;
            }

            return self::isTruthy($result);
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * Filter disabled options from answer value.
     *
     * Port of filterDisabledOptions() in packages/config-schema/src/wizard-state-helpers.ts.
     *
     * @param array<string, mixed> $field
     * @param list<string> $disabledOptions
     * @return array{isAnswerDropped: bool, nextAnswer: mixed}
     */
    public static function filterDisabledOptions(array $field, mixed $rawAnswer, array $disabledOptions): array
    {
        if (empty($disabledOptions)) {
            return ['isAnswerDropped' => false, 'nextAnswer' => $rawAnswer];
        }

        $disabledFlip = array_flip($disabledOptions);
        $type = $field['type'] ?? '';

        if ($type === 'checkbox_group') {
            if (is_array($rawAnswer)) {
                $filtered = [];
                foreach ($rawAnswer as $item) {
                    if (is_string($item) && !isset($disabledFlip[$item])) {
                        $filtered[] = $item;
                    }
                }

                return ['isAnswerDropped' => false, 'nextAnswer' => $filtered];
            }

            return ['isAnswerDropped' => false, 'nextAnswer' => $rawAnswer];
        }

        if ($type === 'image_select' && ($field['multiple'] ?? false)) {
            if (is_array($rawAnswer)) {
                $filtered = [];
                foreach ($rawAnswer as $item) {
                    if (is_string($item) && !isset($disabledFlip[$item])) {
                        $filtered[] = $item;
                    }
                }

                return ['isAnswerDropped' => false, 'nextAnswer' => $filtered];
            }

            return ['isAnswerDropped' => false, 'nextAnswer' => $rawAnswer];
        }

        if ($type === 'select' || $type === 'radio' || $type === 'image_select') {
            if (is_string($rawAnswer) && isset($disabledFlip[$rawAnswer])) {
                return ['isAnswerDropped' => true, 'nextAnswer' => null];
            }
        }

        return ['isAnswerDropped' => false, 'nextAnswer' => $rawAnswer];
    }

    /**
     * Check if a field value is considered empty for required check.
     *
     * Port of isAnswerEmpty() in packages/config-schema/src/wizard-state-helpers.ts.
     *
     * @param array<string, mixed> $field
     */
    public static function isAnswerEmpty(array $field, mixed $value): bool
    {
        if ($value === null) {
            return true;
        }

        $type = $field['type'] ?? '';
        if ($type === 'boolean') {
            return !is_bool($value);
        }

        if (is_string($value)) {
            return trim($value) === '';
        }

        if (is_array($value)) {
            return count($value) === 0;
        }

        if (is_int($value)) {
            return false;
        }

        if (is_float($value)) {
            return !is_finite($value);
        }

        return true;
    }

    /**
     * Resolve full wizard state (visibility, disabled options, pruned answers, missing required).
     *
     * Exact port of resolveWizardState() in packages/config-schema/src/wizard-state.ts.
     *
     * @param array<string, mixed> $wizard
     * @param array<string, mixed> $answers
     * @return array{
     *     visible: array<string, bool>,
     *     disabled: array<string, bool>,
     *     disabledOptions: array<string, list<string>>,
     *     answers: array<string, mixed>,
     *     missingRequired: list<string>
     * }
     */
    public static function resolveWizardState(array $wizard, array $answers): array
    {
        $allFields = self::collectFields($wizard);
        /** @var array<string, array<string, mixed>> $fieldMap */
        $fieldMap = [];
        foreach ($allFields as $field) {
            $fieldMap[$field['key']] = $field;
        }

        // Only the wizard's own field keys are read (bounded cost regardless of input size)
        $currentAnswers = [];
        foreach ($fieldMap as $key => $field) {
            if (array_key_exists($key, $answers)) {
                $norm = self::normalizeAnswer($answers[$key]);
                if ($norm !== null || $answers[$key] === null) {
                    $currentAnswers[$key] = $norm;
                }
            }
        }

        $maxPasses = count($allFields) + 1;
        $finalDisabledOptions = [];
        $finalVisible = [];

        for ($pass = 0; $pass < $maxPasses; $pass++) {
            $hasChanged = false;
            $visibleMap = [];
            $disabledOptionsMap = [];

            foreach ($allFields as $field) {
                $key = $field['key'];
                $isVisible = isset($field['visibleWhen'])
                    ? self::evaluateCondition($field['visibleWhen'], $currentAnswers)
                    : true;
                $visibleMap[$key] = $isVisible;

                if (!$isVisible && array_key_exists($key, $currentAnswers)) {
                    unset($currentAnswers[$key]);
                    $hasChanged = true;
                }

                $type = $field['type'] ?? '';
                if (in_array($type, ['select', 'radio', 'checkbox_group', 'image_select'], true)) {
                    $disabledList = [];
                    $options = $field['options'] ?? [];
                    if (is_array($options)) {
                        foreach ($options as $opt) {
                            if (is_array($opt) && isset($opt['disabledWhen'])) {
                                if (self::evaluateCondition($opt['disabledWhen'], $currentAnswers)) {
                                    if (isset($opt['value']) && is_string($opt['value'])) {
                                        $disabledList[] = $opt['value'];
                                    }
                                }
                            }
                        }
                    }
                    $disabledOptionsMap[$key] = $disabledList;

                    if ($isVisible && array_key_exists($key, $currentAnswers)) {
                        $val = $currentAnswers[$key];
                        $filterRes = self::filterDisabledOptions($field, $val, $disabledList);
                        if ($filterRes['isAnswerDropped']) {
                            unset($currentAnswers[$key]);
                            $hasChanged = true;
                        } elseif (!self::isStrictEqual($filterRes['nextAnswer'], $val)) {
                            $currentAnswers[$key] = $filterRes['nextAnswer'];
                            $hasChanged = true;
                        }
                    }
                } else {
                    $disabledOptionsMap[$key] = [];
                }
            }

            $finalVisible = $visibleMap;
            $finalDisabledOptions = $disabledOptionsMap;

            if (!$hasChanged) {
                break;
            }
        }

        $disabled = [];
        $missingRequired = [];

        foreach ($allFields as $field) {
            $key = $field['key'];
            $isVisible = $finalVisible[$key] ?? true;
            $isDisabled = isset($field['disabledWhen'])
                ? self::evaluateCondition($field['disabledWhen'], $currentAnswers)
                : false;
            $disabled[$key] = $isDisabled;

            if (!empty($field['required']) && $isVisible && !$isDisabled) {
                $ans = array_key_exists($key, $currentAnswers) ? $currentAnswers[$key] : null;
                if (self::isAnswerEmpty($field, $ans)) {
                    $missingRequired[] = $key;
                }
            }
        }

        return [
            'visible' => $finalVisible,
            'disabled' => $disabled,
            'disabledOptions' => $finalDisabledOptions,
            'answers' => $currentAnswers,
            'missingRequired' => $missingRequired,
        ];
    }

    /**
     * Alias for resolveWizardState.
     *
     * @param array<string, mixed> $wizard
     * @param array<string, mixed> $answers
     * @return array{
     *     visible: array<string, bool>,
     *     disabled: array<string, bool>,
     *     disabledOptions: array<string, list<string>>,
     *     answers: array<string, mixed>,
     *     missingRequired: list<string>
     * }
     */
    public static function resolve(array $wizard, array $answers): array
    {
        return self::resolveWizardState($wizard, $answers);
    }

    /**
     * Recursive evaluator for AST nodes.
     *
     * @param array<string, mixed> $answers
     */
    private static function evalNode(mixed $node, array $answers, int $depth, ConditionEvalState $state): mixed
    {
        if ($state->hasExceededLimits || $depth > 8) {
            $state->hasExceededLimits = true;

            return false;
        }

        $state->nodeCount += 1;
        if ($state->nodeCount > 80) {
            $state->hasExceededLimits = true;

            return false;
        }

        if ($node === null || is_string($node) || is_int($node) || is_float($node) || is_bool($node)) {
            return $node;
        }

        if (!is_array($node)) {
            return false;
        }

        if (isset($node['var']) && is_string($node['var'])) {
            return self::readVar($answers, $node['var']);
        }

        if (isset($node['and']) && is_array($node['and'])) {
            $state->nodeCount += count($node['and']);
            if ($state->nodeCount > 80) {
                $state->hasExceededLimits = true;

                return false;
            }
            foreach ($node['and'] as $child) {
                if (!self::isTruthy(self::evalNode($child, $answers, $depth + 1, $state))) {
                    return false;
                }
            }

            return true;
        }

        if (isset($node['or']) && is_array($node['or'])) {
            $state->nodeCount += count($node['or']);
            if ($state->nodeCount > 80) {
                $state->hasExceededLimits = true;

                return false;
            }
            foreach ($node['or'] as $child) {
                if (self::isTruthy(self::evalNode($child, $answers, $depth + 1, $state))) {
                    return true;
                }
            }

            return false;
        }

        if (isset($node['!']) && is_array($node['!']) && count($node['!']) > 0) {
            return !self::isTruthy(self::evalNode($node['!'][0], $answers, $depth + 1, $state));
        }

        foreach (['==', '!=', '<', '<=', '>', '>='] as $op) {
            if (isset($node[$op]) && is_array($node[$op]) && count($node[$op]) === 2) {
                $left = self::evalNode($node[$op][0], $answers, $depth + 1, $state);
                $right = self::evalNode($node[$op][1], $answers, $depth + 1, $state);

                return self::evaluateBinaryOp($left, $right, $op);
            }
        }

        if (isset($node['in']) && is_array($node['in']) && count($node['in']) === 2) {
            $needle = self::evalNode($node['in'][0], $answers, $depth + 1, $state);
            $haystackNode = $node['in'][1];
            $state->nodeCount += 1;
            if (is_array($haystackNode)) {
                $state->nodeCount += count($haystackNode);
            }
            if ($state->nodeCount > 80) {
                $state->hasExceededLimits = true;

                return false;
            }

            return self::evalIn($needle, $haystackNode, answers: $answers);
        }

        return false;
    }
}
