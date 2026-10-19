import { z } from 'zod';
import {
    DesignConstraintsSchema,
    type DesignConstraints,
    type Plan,
} from '@aihome/planner';
import { apiClient } from '@/shared/api';
import {
    type AiConstraintsResponse,
    type AiCommentaryResponse,
    type AiSource,
} from '../types';

const AiSourceSchema = z.enum(['gemini', 'claude', 'local']);

const AiConstraintsResponseSchema = z
    .object({
        constraints: DesignConstraintsSchema,
        source: AiSourceSchema,
        degraded: z.boolean(),
        model: z.string().optional(),
        usage: z
            .object({ inputTokens: z.number(), outputTokens: z.number() })
            .optional(),
        requestId: z.string().optional(),
    })
    .transform((d) => ({
        constraints: d.constraints,
        source: d.source,
        isDegraded: d.degraded,
        model: d.model,
        usage: d.usage,
        requestId: d.requestId,
    }));

const AiCommentaryItemSchema = z.object({
    label: z.string(),
    headline: z.string(),
    body: z.string(),
    pros: z.array(z.string()),
    cautions: z.array(z.string()),
});

const AiCommentaryResponseSchema = z
    .object({
        items: z.array(AiCommentaryItemSchema),
        recommendedLabel: z.string().optional(),
        source: AiSourceSchema.optional(),
        degraded: z.boolean().optional(),
        model: z.string().optional(),
        usage: z
            .object({ inputTokens: z.number(), outputTokens: z.number() })
            .optional(),
        requestId: z.string().optional(),
    })
    .transform((d) => ({
        items: d.items,
        recommendedLabel: d.recommendedLabel,
        source: d.source,
        isDegraded: d.degraded,
        model: d.model,
        usage: d.usage,
        requestId: d.requestId,
    }));

export async function fetchAiConstraints(
    answers: Record<string, unknown>,
    locale = 'ja',
    signal?: AbortSignal,
): Promise<AiConstraintsResponse | null> {
    try {
        const raw = await apiClient('/api/v1/ai/constraints', {
            method: 'POST',
            body: { answers, locale },
            signal,
        });

        const parsed = AiConstraintsResponseSchema.safeParse(raw);
        if (!parsed.success) {
            return null;
        }

        return parsed.data;
    } catch {
        return null;
    }
}

export async function fetchAiCommentary(
    answers: Record<string, unknown>,
    constraints: DesignConstraints | undefined,
    plans: readonly Plan[],
    signal?: AbortSignal,
): Promise<AiCommentaryResponse | null> {
    try {
        const payloadPlans = plans.slice(0, 3).map((p) => ({
            label: p.label,
            score: p.score,
            summary: {
                floorAreaM2: p.summary.floorAreaM2,
                tsubo: p.summary.tsubo,
                roomsList: p.summary.roomsList,
            },
            warnings: p.warnings.map((w) => w.message),
        }));

        const raw = await apiClient('/api/v1/ai/commentary', {
            method: 'POST',
            body: {
                answers,
                constraints: constraints ?? {},
                plans: payloadPlans,
            },
            signal,
        });

        const parsed = AiCommentaryResponseSchema.safeParse(raw);
        if (!parsed.success) {
            return null;
        }

        return parsed.data;
    } catch {
        return null;
    }
}

export function getSourceLabel(source: AiSource | undefined): string {
    if (source === 'gemini') return 'Gemini';
    if (source === 'claude') return 'Claude';
    return 'Local';
}
