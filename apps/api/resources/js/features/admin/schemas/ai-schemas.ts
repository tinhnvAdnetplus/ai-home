import { z } from 'zod';
import type { AiUsageData } from '../types/admin-types';

export const aiCallMetricSchema = z
    .object({
        id: z.number(),
        user_id: z.number().nullable().optional(),
        userId: z.number().nullable().optional(),
        user_name: z.string().nullable().optional(),
        userName: z.string().nullable().optional(),
        endpoint: z.string(),
        provider: z.string(),
        model: z.string(),
        source: z.string(),
        degraded: z.boolean().optional(),
        isDegraded: z.boolean().optional(),
        input_tokens: z.number().optional(),
        inputTokens: z.number().optional(),
        output_tokens: z.number().optional(),
        outputTokens: z.number().optional(),
        latency_ms: z.number().optional(),
        latencyMs: z.number().optional(),
        status: z.number(),
        created_at: z.string().nullable().optional(),
        createdAt: z.string().nullable().optional(),
    })
    .transform((item) => ({
        id: item.id,
        userId: item.userId ?? item.user_id ?? null,
        userName: item.userName ?? item.user_name ?? null,
        endpoint: item.endpoint,
        provider: item.provider,
        model: item.model,
        source: item.source,
        isDegraded: item.isDegraded ?? item.degraded ?? false,
        inputTokens: item.inputTokens ?? item.input_tokens ?? 0,
        outputTokens: item.outputTokens ?? item.output_tokens ?? 0,
        latencyMs: item.latencyMs ?? item.latency_ms ?? 0,
        status: item.status,
        createdAt: item.createdAt ?? item.created_at ?? null,
    }));

export const aiDailyTotalSchema = z
    .object({
        date: z.string(),
        provider: z.string(),
        total_calls: z.number().optional(),
        totalCalls: z.number().optional(),
        total_input_tokens: z.number().optional(),
        totalInputTokens: z.number().optional(),
        total_output_tokens: z.number().optional(),
        totalOutputTokens: z.number().optional(),
        avg_latency_ms: z.number().optional(),
        avgLatencyMs: z.number().optional(),
        degraded_calls: z.number().optional(),
        degradedCalls: z.number().optional(),
    })
    .transform((item) => ({
        date: item.date,
        provider: item.provider,
        totalCalls: item.totalCalls ?? item.total_calls ?? 0,
        totalInputTokens: item.totalInputTokens ?? item.total_input_tokens ?? 0,
        totalOutputTokens:
            item.totalOutputTokens ?? item.total_output_tokens ?? 0,
        avgLatencyMs: item.avgLatencyMs ?? item.avg_latency_ms ?? 0,
        degradedCalls: item.degradedCalls ?? item.degraded_calls ?? 0,
    }));

export const aiUsageResponseSchema = z
    .object({
        recent_calls: z.array(aiCallMetricSchema).optional(),
        recentCalls: z.array(aiCallMetricSchema).optional(),
        daily_totals: z.array(aiDailyTotalSchema).optional(),
        dailyTotals: z.array(aiDailyTotalSchema).optional(),
    })
    .transform((data): AiUsageData => ({
        recentCalls: data.recentCalls ?? data.recent_calls ?? [],
        dailyTotals: data.dailyTotals ?? data.daily_totals ?? [],
    }));
