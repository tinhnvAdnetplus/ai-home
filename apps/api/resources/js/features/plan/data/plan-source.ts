import { type PlanInput } from '@aihome/planner';
import {
    PLAN_PRESETS,
    type PlanPreset,
    TWO_STOREY_STANDARD_INPUT,
} from './sample-inputs';

/**
 * Data-source seam: returns bundled sample presets.
 * To swap for backend later:
 * Replace this in-memory loader with an HTTP query (e.g. `http.get('/api/v1/plans')`
 * or a TanStack Query hook calling Laravel API endpoint `GET /api/v1/user/plans`).
 */
export function loadSampleInputs(): readonly PlanPreset[] {
    return PLAN_PRESETS;
}

/**
 * Local adapter to map arbitrary wizard answers to PlanInput.
 * Temporary bridge until T3.8 `packages/planner/src/answers-mapping.ts` is exported.
 */
function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function mapAnswersToPlanInput(answers: unknown): PlanInput {
    if (isRecord(answers)) {
        const floorsVal = answers.floors === 1 ? 1 : 2;
        const roadSideVal =
            answers.roadSide === '北' ||
            answers.roadSide === '東' ||
            answers.roadSide === '西'
                ? answers.roadSide
                : '南';

        return {
            ...TWO_STOREY_STANDARD_INPUT,
            floors: floorsVal,
            roadSide: roadSideVal,
        };
    }
    return TWO_STOREY_STANDARD_INPUT;
}
