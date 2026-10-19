import { type Issue } from './issue-codes.js';

export function detectConditionCycles(
    dependencyGraph: ReadonlyMap<string, readonly string[]>,
    fieldPaths: ReadonlyMap<string, readonly (string | number)[]>,
): Issue[] {
    const issues: Issue[] = [];
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const reportedCycles = new Set<string>();

    function dfs(node: string, path: string[]): void {
        visited.add(node);
        inStack.add(node);
        path.push(node);

        const neighbors = dependencyGraph.get(node) ?? [];
        for (const neighbor of neighbors) {
            if (neighbor === node) {
                // Handled as SELF_REFERENCE elsewhere
                continue;
            }
            if (inStack.has(neighbor)) {
                const cycleStartIndex = path.indexOf(neighbor);
                const cycle = path.slice(cycleStartIndex);
                cycle.push(neighbor);
                const cycleKey = [...cycle].sort().join(':');
                if (!reportedCycles.has(cycleKey)) {
                    reportedCycles.add(cycleKey);
                    const targetFieldPath = fieldPaths.get(node) ?? [
                        'fields',
                        node,
                    ];
                    issues.push({
                        path: targetFieldPath,
                        code: 'CONDITION_CYCLE',
                        message: `Cyclic condition dependency detected: ${cycle.join(' -> ')}`,
                    });
                }
            } else if (!visited.has(neighbor)) {
                dfs(neighbor, path);
            }
        }

        path.pop();
        inStack.delete(node);
    }

    for (const node of dependencyGraph.keys()) {
        if (!visited.has(node)) {
            dfs(node, []);
        }
    }

    return issues;
}
