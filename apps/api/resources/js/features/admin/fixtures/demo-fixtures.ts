import { sampleWizard } from '@aihome/config-schema';
import type {
    ConfigDocumentSummary,
    ConfigDocumentDetail,
    ConfigVersionMeta,
    ConfigVersionDetail,
    ConfigAuditLogEntry,
} from '../types/admin-types';

export { initialDemoAiUsage } from './demo-ai-fixtures';

export function createDemoWizardDraft(): typeof sampleWizard {
    const draft = structuredClone(sampleWizard);
    const field0 = draft.steps[0]?.sections[0]?.fields[0];
    const isInvalid =
        typeof window !== 'undefined' &&
        (window.location.hash.includes('invalid=1') ||
            window.location.hash.includes('validation=error'));
    if (field0) {
        field0.label = isInvalid
            ? { ja: '' }
            : {
                  ja: '建築の主な目的（下書き編集版）',
                  en: 'Primary Purpose of Building (Draft Edited)',
                  vi: 'Mục đích xây dựng chính (Bản nháp)',
              };
    }
    return draft;
}

export const initialDemoDocuments: readonly ConfigDocumentSummary[] = [
    {
        id: 1,
        key: 'wizard',
        scope: 'global',
        currentPublishedVersion: 10,
        publishedAt: '2026-10-12T13:23:36.000000Z',
        hasDraft: true,
        draftUpdatedAt: '2026-10-12T13:45:10.000000Z',
    },
];

export const initialDemoVersions: readonly ConfigVersionMeta[] = [
    {
        id: 10,
        version: 10,
        status: 'published',
        schemaVersion: 1,
        payloadHash:
            '746aad2d947c5b38f999afa27f375a8ce53fd9d9bfa6dc34ef445193ee28ef63',
        label: 'Default Wizard v10 (Current)',
        publishedAt: '2026-10-12T13:23:36.000000Z',
        createdAt: '2026-10-12T13:20:00.000000Z',
    },
    {
        id: 9,
        version: 9,
        status: 'archived',
        schemaVersion: 1,
        payloadHash:
            '439a8c1209bfae3458c9f012de9408bcf193aef445193ee28ef63746aad2d947',
        label: 'Step 3 options enhancement',
        publishedAt: '2026-10-11T09:15:00.000000Z',
        createdAt: '2026-10-11T09:00:00.000000Z',
    },
];

export const initialDemoAuditLogs: readonly ConfigAuditLogEntry[] = [
    {
        id: 25,
        action: 'publish',
        version: 10,
        user: { id: 1, name: 'Admin User' },
        summary: { label: 'Default Wizard v10 (Current)', version: 10 },
        requestId: 'req-demo-pub-001',
        createdAt: '2026-10-12T13:23:36.000000Z',
    },
    {
        id: 24,
        action: 'draft_save',
        version: 11,
        user: { id: 1, name: 'Admin User' },
        summary: { label: 'Updated purpose question' },
        requestId: 'req-demo-draft-002',
        createdAt: '2026-10-12T13:45:10.000000Z',
    },
];

export function getDemoDocumentDetail(): ConfigDocumentDetail {
    const publishedVersion: ConfigVersionDetail = {
        id: 10,
        version: 10,
        status: 'published',
        schemaVersion: 1,
        payloadHash:
            '746aad2d947c5b38f999afa27f375a8ce53fd9d9bfa6dc34ef445193ee28ef63',
        label: 'Default Wizard v10 (Current)',
        publishedAt: '2026-10-12T13:23:36.000000Z',
        payload: sampleWizard,
    };

    const draftVersion: ConfigVersionDetail = {
        id: 11,
        version: 11,
        status: 'draft',
        schemaVersion: 1,
        payloadHash: 'demo-draft-hash-abc123',
        etag: '"demo-draft-etag-123"',
        label: 'Draft: Updated question',
        payload: createDemoWizardDraft(),
    };

    return {
        key: 'wizard',
        scope: 'global',
        publishedVersion,
        draftVersion,
        recentVersions: [publishedVersion, ...initialDemoVersions],
    };
}

export function saveDemoDraft(
    doc: ConfigDocumentDetail,
    payload: unknown,
    label?: string | null,
): ConfigVersionDetail {
    return {
        id: (doc.draftVersion?.id ?? 10) + 1,
        version: (doc.publishedVersion?.version ?? 10) + 1,
        status: 'draft',
        schemaVersion: 1,
        payloadHash: 'demo-hash-updated',
        etag: `"demo-draft-etag-${Date.now().toString()}"`,
        label: label ?? 'Updated Draft',
        payload,
        createdAt: new Date().toISOString(),
    };
}

export function publishDemoDraft(
    doc: ConfigDocumentDetail,
    label?: string | null,
): ConfigVersionDetail {
    const newVer = (doc.publishedVersion?.version ?? 10) + 1;
    return {
        id: newVer,
        version: newVer,
        status: 'published',
        schemaVersion: 1,
        payloadHash: 'demo-hash-published',
        label: label ?? `Release v${newVer.toString()}`,
        publishedAt: new Date().toISOString(),
        payload: doc.draftVersion?.payload ?? doc.publishedVersion?.payload,
    };
}
