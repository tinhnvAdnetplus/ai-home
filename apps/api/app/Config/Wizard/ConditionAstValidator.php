<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Validates condition AST against the restricted JSON-Logic subset.
 *
 * Enforces:
 * - Operators: and, or, !, ==, !=, <, <=, >, >=, in
 * - Strict arity and argument types
 * - Variable nodes: { var: key }
 * - Scalar literals: string (<= 200), finite number, bool, null
 * - Depth <= 6, Nodes <= 60, in items <= 50
 * - Bounded recursion depth guard (rejects 50k nested levels without call-stack overflow)
 *
 * Mirrors packages/config-schema/src/condition.ts and condition-metrics.ts.
 */
final class ConditionAstValidator
{
    /**
     * @param  list<string|int>  $path
     * @return list<ConfigIssue>
     */
    public static function validate(mixed $node, array $path): array
    {
        $issues = [];
        $metrics = self::validateNode($node, $path, 1, $issues);

        if ($metrics['depth'] > WizardConstants::MAX_CONDITION_DEPTH) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                "Condition depth {$metrics['depth']} exceeds maximum " . WizardConstants::MAX_CONDITION_DEPTH
            );
        }

        if ($metrics['nodes'] > WizardConstants::MAX_CONDITION_NODES) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                "Condition node count {$metrics['nodes']} exceeds maximum " . WizardConstants::MAX_CONDITION_NODES
            );
        }

        return $issues;
    }

    /**
     * @param  list<string|int>  $path
     * @param  list<ConfigIssue>  $issues
     * @return array{depth: int, nodes: int}
     */
    private static function validateNode(mixed $node, array $path, int $currentDepth, array &$issues): array
    {
        // Recursion depth guard: abort immediate descent if max depth exceeded
        if ($currentDepth > WizardConstants::MAX_CONDITION_DEPTH) {
            return ['depth' => $currentDepth, 'nodes' => 1];
        }

        // 1. Scalar literal
        if (self::isScalarLiteral($node)) {
            if (is_string($node) && mb_strlen($node, 'UTF-8') > WizardConstants::MAX_CONDITION_STRING_LENGTH) {
                $issues[] = new ConfigIssue(
                    $path,
                    ConfigIssueCode::SchemaInvalid,
                    'Condition string literal exceeds ' . WizardConstants::MAX_CONDITION_STRING_LENGTH . ' characters'
                );
            }

            return ['depth' => 1, 'nodes' => 1];
        }

        if (! is_array($node) || array_is_list($node)) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                'Invalid condition node: expected scalar literal or single-key object'
            );

            return ['depth' => 1, 'nodes' => 1];
        }

        if (count($node) !== 1) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                'Condition object must have exactly one key'
            );

            return ['depth' => 1, 'nodes' => 1];
        }

        $key = array_key_first($node);
        $val = $node[$key];

        // 2. Var node: { var: key }
        if ($key === 'var') {
            if (! is_string($val) || preg_match(WizardConstants::KEY_REGEX, $val) !== 1) {
                $issues[] = new ConfigIssue(
                    [...$path, 'var'],
                    ConfigIssueCode::SchemaInvalid,
                    'Key must match ^[a-z][a-z0-9_]{0,47}$ (1-48 lowercase letters, numbers, underscores)'
                );
            } elseif (in_array(strtolower($val), WizardConstants::DENIED_KEYS, true)) {
                $issues[] = new ConfigIssue(
                    [...$path, 'var'],
                    ConfigIssueCode::SchemaInvalid,
                    'Key is in the forbidden prototype pollution deny-list'
                );
            }

            return ['depth' => 1, 'nodes' => 1];
        }

        // 3. Operator
        if (! in_array($key, WizardConstants::ALLOWED_OPERATORS, true)) {
            $issues[] = new ConfigIssue(
                $path,
                ConfigIssueCode::SchemaInvalid,
                "Unknown or disallowed condition operator '{$key}'"
            );

            return ['depth' => 1, 'nodes' => 1];
        }

        $opPath = [...$path, $key];

        // and / or: list of 1..10 conditions
        if ($key === 'and' || $key === 'or') {
            if (! is_array($val) || ! array_is_list($val)) {
                $issues[] = new ConfigIssue($opPath, ConfigIssueCode::SchemaInvalid, "Operator '{$key}' expects an array of conditions");

                return ['depth' => 1, 'nodes' => 1];
            }

            $count = count($val);
            if ($count < 1 || $count > 10) {
                $issues[] = new ConfigIssue($opPath, ConfigIssueCode::SchemaInvalid, "Operator '{$key}' expects between 1 and 10 conditions, got {$count}");
            }

            $maxChildDepth = 0;
            $sumChildNodes = 0;
            foreach ($val as $idx => $child) {
                $childMetrics = self::validateNode($child, [...$opPath, $idx], $currentDepth + 1, $issues);
                $maxChildDepth = max($maxChildDepth, $childMetrics['depth']);
                $sumChildNodes += $childMetrics['nodes'];
            }

            return [
                'depth' => 1 + $maxChildDepth,
                'nodes' => 1 + $sumChildNodes,
            ];
        }

        // !: tuple of 1 condition
        if ($key === '!') {
            if (! is_array($val) || ! array_is_list($val) || count($val) !== 1) {
                $issues[] = new ConfigIssue($opPath, ConfigIssueCode::SchemaInvalid, "Operator '!' expects an array with exactly 1 condition");

                return ['depth' => 1, 'nodes' => 1];
            }

            $childMetrics = self::validateNode($val[0], [...$opPath, 0], $currentDepth + 1, $issues);

            return [
                'depth' => 1 + $childMetrics['depth'],
                'nodes' => 1 + $childMetrics['nodes'],
            ];
        }

        // ==, !=, <, <=, >, >=: tuple of 2 conditions
        if (in_array($key, ['==', '!=', '<', '<=', '>', '>='], true)) {
            if (! is_array($val) || ! array_is_list($val) || count($val) !== 2) {
                $issues[] = new ConfigIssue($opPath, ConfigIssueCode::SchemaInvalid, "Operator '{$key}' expects an array with exactly 2 conditions");

                return ['depth' => 1, 'nodes' => 1];
            }

            $m0 = self::validateNode($val[0], [...$opPath, 0], $currentDepth + 1, $issues);
            $m1 = self::validateNode($val[1], [...$opPath, 1], $currentDepth + 1, $issues);

            return [
                'depth' => 1 + max($m0['depth'], $m1['depth']),
                'nodes' => 1 + $m0['nodes'] + $m1['nodes'],
            ];
        }

        // in: tuple of [condition, varNode | scalarLiteral[]]
        if (! is_array($val) || ! array_is_list($val) || count($val) !== 2) {
            $issues[] = new ConfigIssue($opPath, ConfigIssueCode::SchemaInvalid, "Operator 'in' expects an array with exactly 2 elements [value, collection]");

            return ['depth' => 1, 'nodes' => 1];
        }

        $leftMetrics = self::validateNode($val[0], [...$opPath, 0], $currentDepth + 1, $issues);
        $right = $val[1];
        $rightNodes = 1;

        if (is_array($right) && count($right) === 1 && array_key_exists('var', $right)) {
            $varMetrics = self::validateNode($right, [...$opPath, 1], $currentDepth + 1, $issues);
            $rightNodes = $varMetrics['nodes'];
        } elseif (is_array($right) && array_is_list($right)) {
            if (count($right) > WizardConstants::MAX_IN_ITEMS) {
                $issues[] = new ConfigIssue(
                    [...$opPath, 1],
                    ConfigIssueCode::SchemaInvalid,
                    "Right side of 'in' operator exceeds maximum " . WizardConstants::MAX_IN_ITEMS . ' items'
                );
            }

            foreach ($right as $idx => $item) {
                if (! self::isScalarLiteral($item)) {
                    $issues[] = new ConfigIssue(
                        [...$opPath, 1, $idx],
                        ConfigIssueCode::SchemaInvalid,
                        "Elements in 'in' collection must be scalar literals"
                    );
                } elseif (is_string($item) && mb_strlen($item, 'UTF-8') > WizardConstants::MAX_CONDITION_STRING_LENGTH) {
                    $issues[] = new ConfigIssue(
                        [...$opPath, 1, $idx],
                        ConfigIssueCode::SchemaInvalid,
                        'Condition string literal exceeds ' . WizardConstants::MAX_CONDITION_STRING_LENGTH . ' characters'
                    );
                }
            }
            $rightNodes = count($right);
        } else {
            $issues[] = new ConfigIssue(
                [...$opPath, 1],
                ConfigIssueCode::SchemaInvalid,
                "Right side of 'in' operator must be a variable node or a scalar array"
            );
        }

        return [
            'depth' => 1 + max($leftMetrics['depth'], 1),
            'nodes' => 1 + $leftMetrics['nodes'] + $rightNodes,
        ];
    }

    private static function isScalarLiteral(mixed $value): bool
    {
        if ($value === null || is_bool($value) || is_string($value)) {
            return true;
        }

        return (is_int($value) || is_float($value)) && is_finite($value);
    }
}
