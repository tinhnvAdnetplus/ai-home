export type ConditionMetrics = {
    depth: number;
    nodes: number;
};

export function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function calculateMetrics(node: unknown): ConditionMetrics {
    if (
        node === null ||
        typeof node === 'string' ||
        typeof node === 'number' ||
        typeof node === 'boolean'
    ) {
        return { depth: 1, nodes: 1 };
    }
    if (isRecord(node)) {
        if ('var' in node && Object.keys(node).length === 1) {
            return { depth: 1, nodes: 1 };
        }
        const entries = Object.entries(node);
        if (entries.length === 1) {
            const entry = entries[0];
            if (entry !== undefined) {
                const [op, val] = entry;
                if (op === 'in' && Array.isArray(val) && val.length === 2) {
                    const left = calculateMetrics(val[0]);
                    const rightVal: unknown = val[1];
                    let rightNodes = 1;
                    if (Array.isArray(rightVal)) {
                        rightNodes = rightVal.length;
                    } else {
                        rightNodes = calculateMetrics(rightVal).nodes;
                    }
                    return {
                        depth: 1 + Math.max(left.depth, 1),
                        nodes: 1 + left.nodes + rightNodes,
                    };
                }
                if (Array.isArray(val)) {
                    let maxChildDepth = 0;
                    let sumChildNodes = 0;
                    for (const item of val) {
                        const m = calculateMetrics(item);
                        if (m.depth > maxChildDepth) {
                            maxChildDepth = m.depth;
                        }
                        sumChildNodes += m.nodes;
                    }
                    return {
                        depth: 1 + maxChildDepth,
                        nodes: 1 + sumChildNodes,
                    };
                }
            }
        }
    }
    return { depth: 1, nodes: 1 };
}
