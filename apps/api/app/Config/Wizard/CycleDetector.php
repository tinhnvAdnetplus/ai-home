<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * Detects cyclic dependencies in condition expressions using DFS.
 *
 * Mirrors detectConditionCycles in packages/config-schema/src/wizard/cycle-detect.ts.
 */
final class CycleDetector
{
    /**
     * @param  array<string, list<string>>  $dependencyGraph
     * @param  array<string, list<string|int>>  $fieldPaths
     * @return list<ConfigIssue>
     */
    public static function detect(array $dependencyGraph, array $fieldPaths): array
    {
        $issues = [];
        $visited = [];
        $inStack = [];
        $reportedCycles = [];

        $dfs = function (string $node, array $path) use (
            &$dfs,
            &$visited,
            &$inStack,
            &$reportedCycles,
            &$issues,
            $dependencyGraph,
            $fieldPaths
        ): void {
            $visited[$node] = true;
            $inStack[$node] = true;
            $path[] = $node;

            $neighbors = $dependencyGraph[$node] ?? [];
            foreach ($neighbors as $neighbor) {
                if ($neighbor === $node) {
                    // Handled as SELF_REFERENCE elsewhere
                    continue;
                }

                if (! empty($inStack[$neighbor])) {
                    $cycleStartIndex = array_search($neighbor, $path, true);
                    if ($cycleStartIndex === false) {
                        $cycleStartIndex = 0;
                    }
                    $cycle = array_slice($path, (int) $cycleStartIndex);
                    $cycle[] = $neighbor;

                    $sortedCycle = $cycle;
                    sort($sortedCycle, SORT_STRING);
                    $cycleKey = implode(':', $sortedCycle);

                    if (! isset($reportedCycles[$cycleKey])) {
                        $reportedCycles[$cycleKey] = true;
                        $targetFieldPath = $fieldPaths[$node] ?? ['fields', $node];
                        $issues[] = new ConfigIssue(
                            $targetFieldPath,
                            ConfigIssueCode::ConditionCycle,
                            'Cyclic condition dependency detected: ' . implode(' -> ', $cycle)
                        );
                    }
                } elseif (empty($visited[$neighbor])) {
                    $dfs($neighbor, $path);
                }
            }

            array_pop($path);
            unset($inStack[$node]);
        };

        foreach (array_keys($dependencyGraph) as $node) {
            if (empty($visited[$node])) {
                $dfs($node, []);
            }
        }

        return $issues;
    }
}
