import { buildingModelSchema } from './schema.js';
import {
    type BuildingModel,
    type ParseBuildingModelResult,
    type BdmIssue,
} from './types.js';
import { precheckBdmLimits } from './precheck.js';
import { crossValidateBuildingModel } from './cross-validate.js';

export function parseBuildingModel(input: unknown): ParseBuildingModelResult {
    try {
        const precheckIssues = precheckBdmLimits(input);
        if (precheckIssues.length > 0) {
            return { ok: false, issues: precheckIssues };
        }

        const zodResult = buildingModelSchema.safeParse(input);
        if (!zodResult.success) {
            const issues: BdmIssue[] = zodResult.error.issues.map((err) => ({
                path: err.path,
                code: 'SCHEMA_INVALID',
                message: err.message,
                level: 'error',
            }));
            return { ok: false, issues };
        }

        const model: BuildingModel = zodResult.data;
        const crossIssues = crossValidateBuildingModel(model);
        if (crossIssues.length > 0) {
            return { ok: false, issues: crossIssues };
        }

        return { ok: true, data: model };
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : 'Unknown validation exception';
        return {
            ok: false,
            issues: [
                {
                    path: [],
                    code: 'SCHEMA_INVALID',
                    message,
                    level: 'error',
                },
            ],
        };
    }
}
