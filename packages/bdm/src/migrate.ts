import { type ParseBuildingModelResult } from './types.js';
import { parseBuildingModel } from './validate.js';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function migrateBuildingModel(input: unknown): ParseBuildingModelResult {
    if (!isRecord(input)) {
        return parseBuildingModel(input);
    }

    const version = input.schemaVersion;
    if (version === 1) {
        return parseBuildingModel(input);
    }

    return {
        ok: false,
        issues: [
            {
                path: ['schemaVersion'],
                code: 'UNSUPPORTED_SCHEMA_VERSION',
                message: `Unsupported BuildingModel schemaVersion: ${String(version)}`,
                level: 'error',
            },
        ],
    };
}
