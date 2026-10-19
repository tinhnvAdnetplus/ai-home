function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortKeys);
    }
    if (isRecord(value)) {
        const sorted: Record<string, unknown> = {};
        const keys = Object.keys(value).sort();
        for (const key of keys) {
            sorted[key] = sortKeys(value[key]);
        }
        return sorted;
    }
    return value;
}

export function serializeDeterministic(value: unknown): string {
    return `${JSON.stringify(sortKeys(value), null, 2)}\n`;
}
