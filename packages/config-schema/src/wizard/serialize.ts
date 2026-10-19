import { type WizardConfig } from './wizard-schema.js';

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function stableSort(val: unknown): unknown {
    if (val === null || typeof val !== 'object') {
        return val;
    }
    if (Array.isArray(val)) {
        return val.map((item) => stableSort(item));
    }
    if (isRecord(val)) {
        const sortedObj: Record<string, unknown> = {};
        const keys = Object.keys(val).sort();
        for (const key of keys) {
            sortedObj[key] = stableSort(val[key]);
        }
        return sortedObj;
    }
    return val;
}

export function serializeWizardConfig(config: WizardConfig): string {
    const sorted = stableSort(config);
    return JSON.stringify(sorted, null, 2);
}
