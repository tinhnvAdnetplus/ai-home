import { z } from 'zod';
import { apiClient } from '@/shared/api';

const BriefSchema = z.object({
    summary: z.string().max(1000),
    reasoning: z.string().max(3000).optional(),
    adjustments: z
        .array(
            z.object({
                action: z.enum(['set', 'remove', 'add']),
                field: z.string().max(40),
                value: z.string().max(60),
                wish: z.string().max(200),
                reason: z.string().max(600),
            }),
        )
        .max(12),
    suggestions: z.array(z.string().max(400)).max(8),
    questions: z.array(z.string().max(400)).max(5),
    isResolved: z.boolean().optional(),
});

export type AiBrief = z.infer<typeof BriefSchema>;

const ResponseSchema = z.object({
    brief: z.unknown(),
    degraded: z.boolean().optional(),
});

/** Ask the backend (Gemini) to review the program against the measured lot facts. Null when the AI is unavailable. */
export async function fetchAiBrief(
    context: Record<string, unknown>,
    issues?: readonly string[],
    previousAnswer?: AiBrief,
    signal?: AbortSignal,
): Promise<AiBrief | null> {
    try {
        const raw = await apiClient('/api/v1/ai/brief', {
            method: 'POST',
            body: { context, issues, previousAnswer },
            signal,
        });
        const parsed = ResponseSchema.safeParse(raw);
        if (!parsed.success || parsed.data.degraded === true) return null;
        const brief = BriefSchema.safeParse(parsed.data.brief);
        return brief.success ? brief.data : null;
    } catch {
        return null;
    }
}
