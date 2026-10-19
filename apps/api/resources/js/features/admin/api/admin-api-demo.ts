import type {
    ConfigDocumentDetail,
    ConfigVersionDetail,
    ConfigVersionMeta,
} from '../types/admin-types';
import {
    getDemoDocumentDetail,
    initialDemoVersions,
    saveDemoDraft,
    publishDemoDraft,
} from '../fixtures/demo-fixtures';

let demoCurrentDoc: ConfigDocumentDetail | null = null;
let demoVersionsList: ConfigVersionMeta[] = [...initialDemoVersions];

export function getOrInitDemoDoc(): ConfigDocumentDetail {
    demoCurrentDoc ??= getDemoDocumentDetail();
    return demoCurrentDoc;
}

export function handleDemoSaveDraft(
    payload: unknown,
    label?: string | null,
): ConfigVersionDetail {
    const doc = getOrInitDemoDoc();
    const newDraft = saveDemoDraft(doc, payload, label);
    demoCurrentDoc = { ...doc, draftVersion: newDraft };
    return newDraft;
}

export function handleDemoDiscardDraft(): void {
    if (demoCurrentDoc) {
        demoCurrentDoc = { ...demoCurrentDoc, draftVersion: null };
    }
}

export function handleDemoPublishDraft(
    label?: string | null,
): ConfigVersionDetail {
    const doc = getOrInitDemoDoc();
    const pub = publishDemoDraft(doc, label);
    demoCurrentDoc = {
        ...doc,
        publishedVersion: pub,
        draftVersion: null,
        recentVersions: [pub, ...demoVersionsList],
    };
    demoVersionsList = [pub, ...demoVersionsList];
    return pub;
}

export function handleDemoRollback(version: number): ConfigVersionDetail {
    const doc = getOrInitDemoDoc();
    const newVer = (doc.publishedVersion?.version ?? 10) + 1;
    const rolled: ConfigVersionDetail = {
        id: newVer,
        version: newVer,
        status: 'published',
        schemaVersion: 1,
        payloadHash: 'demo-hash-rollback',
        label: `Rollback to v${version.toString()}`,
        publishedAt: new Date().toISOString(),
        payload: doc.publishedVersion?.payload,
    };
    demoCurrentDoc = { ...doc, publishedVersion: rolled };
    demoVersionsList = [rolled, ...demoVersionsList];
    return rolled;
}

export function getDemoVersions(): readonly ConfigVersionMeta[] {
    return demoVersionsList;
}
