import { z } from 'zod';
import type { ConfigDocumentDetail } from '../types/admin-types';

export const configVersionMetaSchema = z.object({
    id: z.number(),
    version: z.number(),
    status: z.enum(['draft', 'published', 'archived']),
    schemaVersion: z.number().optional().default(1),
    payloadHash: z
        .string()
        .nullable()
        .optional()
        .transform((v) => v ?? ''),
    label: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
});

export const configVersionDetailSchema = configVersionMetaSchema.extend({
    etag: z.string().optional(),
    payload: z.unknown().optional(),
});

export const configDocumentSummarySchema = z.object({
    id: z.number().nullable(),
    key: z.string(),
    scope: z.string(),
    currentPublishedVersion: z.number().nullable().optional().default(null),
    publishedAt: z.string().nullable().optional().default(null),
    hasDraft: z.boolean().optional().default(false),
    draftUpdatedAt: z.string().nullable().optional().default(null),
});

export const configDocumentDetailSchema = z
    .object({
        key: z.string(),
        scope: z.string(),
        published_version: configVersionDetailSchema.nullable().optional(),
        publishedVersion: configVersionDetailSchema.nullable().optional(),
        draft_version: configVersionDetailSchema.nullable().optional(),
        draft: configVersionDetailSchema.nullable().optional(),
        recent_versions: z
            .array(configVersionMetaSchema)
            .optional()
            .default([]),
        recentVersions: z.array(configVersionMetaSchema).optional().default([]),
    })
    .transform((doc): ConfigDocumentDetail => ({
        key: doc.key,
        scope: doc.scope,
        publishedVersion: doc.publishedVersion ?? doc.published_version ?? null,
        draftVersion: doc.draft ?? doc.draft_version ?? null,
        recentVersions:
            doc.recentVersions.length > 0
                ? doc.recentVersions
                : doc.recent_versions,
    }));

export const configAuditLogEntrySchema = z
    .object({
        id: z.number(),
        action: z.string(),
        version: z.number().nullable().optional().default(null),
        user: z
            .object({ id: z.number(), name: z.string() })
            .nullable()
            .optional()
            .default(null),
        summary: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional()
            .default(null),
        requestId: z.string().nullable().optional().default(null),
        request_id: z.string().nullable().optional().default(null),
        createdAt: z.string().nullable().optional().default(null),
        created_at: z.string().nullable().optional().default(null),
    })
    .transform((log) => ({
        id: log.id,
        action: log.action,
        version: log.version,
        user: log.user,
        summary: log.summary,
        requestId: log.requestId ?? log.request_id ?? null,
        createdAt: log.createdAt ?? log.created_at ?? null,
    }));

export {
    aiCallMetricSchema,
    aiDailyTotalSchema,
    aiUsageResponseSchema,
} from './ai-schemas';
