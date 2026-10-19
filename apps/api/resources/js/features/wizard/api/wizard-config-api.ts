import { parseWizardConfig, type WizardConfig } from '@aihome/config-schema';
import { requestJson } from '@/shared/lib/http';

export type ApiWizardConfig = {
    readonly wizard: WizardConfig;
    readonly version: number | null;
};

type ConfigDocumentPayload = {
    readonly version?: number | undefined;
    readonly payload?: unknown;
};

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function parseConfigDoc(val: unknown): ConfigDocumentPayload | null {
    if (!isRecord(val)) {
        return null;
    }
    const version = typeof val.version === 'number' ? val.version : undefined;
    return {
        version,
        payload: val.payload,
    };
}

export async function fetchWizardConfig(
    signal?: AbortSignal,
): Promise<ApiWizardConfig | null> {
    try {
        const raw = await requestJson(
            '/api/v1/config/bundle',
            signal !== undefined ? { signal } : undefined,
        );

        if (!isRecord(raw) || !isRecord(raw.configs)) {
            return null;
        }

        const wizardRaw = raw.configs.wizard;
        const wizardDoc = parseConfigDoc(wizardRaw);
        if (wizardDoc?.payload === undefined) {
            return null;
        }

        const parseResult = parseWizardConfig(wizardDoc.payload);
        if (!parseResult.ok) {
            return null;
        }

        return {
            wizard: parseResult.data,
            version: wizardDoc.version ?? null,
        };
    } catch {
        return null;
    }
}
