<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Extracts referenced variable keys from a Condition AST.
 *
 * Implemented iteratively to guarantee bounded call-stack depth.
 * Mirrors collectConditionVars in packages/config-schema/src/condition.ts.
 */
final class ConditionVars
{
    /**
     * @return list<string> Sorted array of unique variable names.
     */
    public static function collect(mixed $condition): array
    {
        if ($condition === null || ! is_array($condition)) {
            return [];
        }

        $vars = [];
        $stack = [$condition];

        while (! empty($stack)) {
            $node = array_pop($stack);

            if (count($node) === 1 && array_key_exists('var', $node) && is_string($node['var'])) {
                $vars[$node['var']] = true;
                continue;
            }

            foreach ($node as $child) {
                if (is_array($child)) {
                    $stack[] = $child;
                }
            }
        }

        $result = array_keys($vars);
        sort($result, SORT_STRING);

        return $result;
    }
}
