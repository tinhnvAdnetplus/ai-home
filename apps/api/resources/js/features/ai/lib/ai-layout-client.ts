import { z } from 'zod';
import { apiClient } from '@/shared/api';

const LayoutResponseSchema = z.object({
    layout: z.unknown(),
    degraded: z.boolean().optional(),
});

/** Ask the backend (Gemini) to design / repair a room layout. Returns null when the AI is unavailable. */
export async function fetchAiLayout(
    context: Record<string, unknown>,
    issues?: readonly string[],
    previousLayout?: unknown,
    signal?: AbortSignal,
): Promise<unknown> {
    try {
        const raw = await apiClient('/api/v1/ai/layout', {
            method: 'POST',
            body: { context, issues, previousLayout },
            signal,
        });
        const parsed = LayoutResponseSchema.safeParse(raw);
        if (!parsed.success || parsed.data.degraded === true) return null;
        return parsed.data.layout;
    } catch {
        return null;
    }
}
