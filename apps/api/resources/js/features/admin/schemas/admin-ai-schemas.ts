import { z } from 'zod';
import type {
    TestPromptResponse,
    AiConfigPayload,
    AiPromptsGroup,
} from '../types/admin-types';

export const testPromptResponseSchema: z.ZodType<
    TestPromptResponse,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        output: z.record(z.string(), z.unknown()),
        valid: z.boolean().catch(false),
        issues: z.array(z.string()).catch([]),
        usage: z.object({
            inputTokens: z.number().catch(0),
            outputTokens: z.number().catch(0),
        }),
        latencyMs: z.number().catch(0),
        source: z.string().catch('local'),
    })
    .transform((data) => ({
        output: data.output,
        isValid: data.valid,
        issues: data.issues,
        usage: data.usage,
        latencyMs: data.latencyMs,
        source: data.source,
    }));

export const aiPromptsGroupSchema: z.ZodType<
    AiPromptsGroup,
    z.ZodTypeDef,
    unknown
> = z.object({
    ja: z.string(),
    en: z.string().optional(),
    vi: z.string().optional(),
});

export const aiConfigPayloadSchema: z.ZodType<
    AiConfigPayload,
    z.ZodTypeDef,
    unknown
> = z
    .object({
        schemaVersion: z.number().optional(),
        provider: z.enum(['gemini', 'claude', 'local']),
        model: z.string(),
        temperature: z.number(),
        maxTokens: z.number(),
        dailyLimit: z.number(),
        timeoutSeconds: z.number(),
        enabled: z.boolean().catch(true),
        prompts: z.object({
            constraints: aiPromptsGroupSchema,
            commentary: aiPromptsGroupSchema,
        }),
    })
    .transform((data) => ({
        schemaVersion: data.schemaVersion,
        provider: data.provider,
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        dailyLimit: data.dailyLimit,
        timeoutSeconds: data.timeoutSeconds,
        isEnabled: data.enabled,
        prompts: data.prompts,
    }));
