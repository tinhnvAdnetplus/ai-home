import { z } from 'zod';
import type {
    ConfigDocumentSummary,
    ConfigDocumentDetail,
    ConfigVersionDetail,
    ConfigVersionMeta,
    ConfigAuditLogEntry,
    AiUsageData,
} from '../types/admin-types';
import {
    initialDemoDocuments,
    initialDemoAuditLogs,
    initialDemoAiUsage,
} from '../fixtures/demo-fixtures';
import {
    getOrInitDemoDoc,
    handleDemoSaveDraft,
    handleDemoDiscardDraft,
    handleDemoPublishDraft,
    handleDemoRollback,
    getDemoVersions,
} from './admin-api-demo';
import {
    configDocumentDetailSchema,
    configDocumentSummarySchema,
    configVersionDetailSchema,
    configVersionMetaSchema,
    configAuditLogEntrySchema,
    aiUsageResponseSchema,
} from '../schemas/admin-schemas';
import { requestAdmin, isDemoMode } from './admin-http';

export { isDemoMode } from './admin-http';

export async function fetchAdminConfigs(): Promise<
    readonly ConfigDocumentSummary[]
> {
    if (isDemoMode()) return initialDemoDocuments;
    const raw = await requestAdmin('/api/v1/admin/configs');
    return z.object({ data: z.array(configDocumentSummarySchema) }).parse(raw)
        .data;
}

export async function fetchAdminConfigDoc(
    key: string,
): Promise<ConfigDocumentDetail> {
    if (isDemoMode()) return getOrInitDemoDoc();
    const raw = await requestAdmin(
        `/api/v1/admin/configs/${encodeURIComponent(key)}`,
    );
    return configDocumentDetailSchema.parse(raw);
}

export async function saveDraft(
    key: string,
    payload: unknown,
    label?: string | null,
    etag?: string | null,
): Promise<ConfigVersionDetail> {
    if (isDemoMode()) return handleDemoSaveDraft(payload, label);
    const headers: Record<string, string> = {};
    if (etag) headers['If-Match'] = etag;
    const raw = await requestAdmin(
        `/api/v1/admin/configs/${encodeURIComponent(key)}/draft`,
        {
            method: 'PUT',
            headers,
            body: JSON.stringify({ payload, label }),
        },
    );
    return configVersionDetailSchema.parse(raw);
}

export async function discardDraft(key: string): Promise<void> {
    if (isDemoMode()) {
        handleDemoDiscardDraft();
        return;
    }
    await requestAdmin(
        `/api/v1/admin/configs/${encodeURIComponent(key)}/draft`,
        {
            method: 'DELETE',
        },
    );
}

export async function publishDraft(
    key: string,
    label?: string | null,
): Promise<ConfigVersionDetail> {
    if (isDemoMode()) return handleDemoPublishDraft(label);
    const raw = await requestAdmin(
        `/api/v1/admin/configs/${encodeURIComponent(key)}/publish`,
        {
            method: 'POST',
            body: JSON.stringify({ label }),
        },
    );
    return configVersionDetailSchema.parse(raw);
}

export async function rollbackVersion(
    key: string,
    version: number,
): Promise<ConfigVersionDetail> {
    if (isDemoMode()) return handleDemoRollback(version);
    const raw = await requestAdmin(
        `/api/v1/admin/configs/${encodeURIComponent(key)}/rollback`,
        {
            method: 'POST',
            body: JSON.stringify({ version }),
        },
    );
    return configVersionDetailSchema.parse(raw);
}

export async function fetchVersions(
    key: string,
): Promise<readonly ConfigVersionMeta[]> {
    if (isDemoMode()) return getDemoVersions();
    const raw = await requestAdmin(
        `/api/v1/admin/configs/${encodeURIComponent(key)}/versions?per_page=50`,
    );
    return z.object({ data: z.array(configVersionMetaSchema) }).parse(raw).data;
}

export async function fetchAuditLogs(
    key: string,
): Promise<readonly ConfigAuditLogEntry[]> {
    if (isDemoMode()) return initialDemoAuditLogs;
    const raw = await requestAdmin(
        `/api/v1/admin/configs/${encodeURIComponent(key)}/audit?per_page=50`,
    );
    return z.object({ data: z.array(configAuditLogEntrySchema) }).parse(raw)
        .data;
}

export async function fetchAiUsage(): Promise<AiUsageData> {
    if (isDemoMode()) return initialDemoAiUsage;
    const raw = await requestAdmin('/api/v1/admin/ai/usage');
    return aiUsageResponseSchema.parse(raw);
}
