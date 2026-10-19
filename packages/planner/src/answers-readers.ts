/**
 * Safe accessor utilities to read wizard answers defensively without throwing.
 */

export function safeRead(
    record: Record<string, unknown>,
    key: string,
): unknown {
    try {
        if (Object.hasOwn(record, key)) {
            return record[key];
        }
    } catch {
        return undefined;
    }
    return undefined;
}

export function safeGetFirst(
    record: Record<string, unknown>,
    keys: readonly string[],
): unknown {
    for (const key of keys) {
        const val = safeRead(record, key);
        if (val !== undefined && val !== null) {
            return val;
        }
    }
    return undefined;
}

export function safeGetNumber(
    record: Record<string, unknown>,
    keys: readonly string[],
    fallback: number,
): number {
    const raw = safeGetFirst(record, keys);
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
    }
    if (typeof raw === 'string') {
        const num = Number(raw.trim());
        if (Number.isFinite(num)) return num;
    }
    return fallback;
}

export function safeGetString(
    record: Record<string, unknown>,
    keys: readonly string[],
    fallback: string,
): string {
    const raw = safeGetFirst(record, keys);
    return typeof raw === 'string' && raw.trim().length > 0
        ? raw.trim()
        : fallback;
}

export function safeGetStringArray(
    record: Record<string, unknown>,
    keys: readonly string[],
): readonly string[] {
    const raw = safeGetFirst(record, keys);
    if (Array.isArray(raw)) {
        return raw.filter((x): x is string => typeof x === 'string');
    }
    if (typeof raw === 'string' && raw.length > 0) {
        return [raw];
    }
    return [];
}
