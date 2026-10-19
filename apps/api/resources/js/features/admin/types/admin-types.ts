import type { WizardConfig, Issue } from '@aihome/config-schema';

export type ConfigDocumentSummary = {
    readonly id: number | null;
    readonly key: string;
    readonly scope: string;
    readonly currentPublishedVersion: number | null;
    readonly publishedAt: string | null;
    readonly hasDraft: boolean;
    readonly draftUpdatedAt: string | null;
};

export type ConfigVersionMeta = {
    readonly id: number;
    readonly version: number;
    readonly status: 'draft' | 'published' | 'archived';
    readonly schemaVersion: number;
    readonly payloadHash: string;
    readonly label?: string | null | undefined;
    readonly publishedAt?: string | null | undefined;
    readonly createdAt?: string | null | undefined;
};

export type ConfigVersionDetail = ConfigVersionMeta & {
    readonly etag?: string | undefined;
    readonly payload?: unknown;
};

export type ConfigDocumentDetail = {
    readonly key: string;
    readonly scope: string;
    readonly publishedVersion: ConfigVersionDetail | null;
    readonly draftVersion: ConfigVersionDetail | null;
    readonly recentVersions: readonly ConfigVersionMeta[];
};

export type ConfigAuditLogEntry = {
    readonly id: number;
    readonly action: string;
    readonly version: number | null;
    readonly user: { readonly id: number; readonly name: string } | null;
    readonly summary: Record<string, unknown> | null;
    readonly requestId: string | null;
    readonly createdAt: string | null;
};

export type AiCallMetric = {
    readonly id: number;
    readonly userId: number | null;
    readonly userName: string | null;
    readonly endpoint: string;
    readonly provider: string;
    readonly model: string;
    readonly source: string;
    readonly isDegraded: boolean;
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly latencyMs: number;
    readonly status: number;
    readonly createdAt: string | null;
};

export type AiDailyTotal = {
    readonly date: string;
    readonly provider: string;
    readonly totalCalls: number;
    readonly totalInputTokens: number;
    readonly totalOutputTokens: number;
    readonly avgLatencyMs: number;
    readonly degradedCalls: number;
};

export type AiUsageData = {
    readonly recentCalls: readonly AiCallMetric[];
    readonly dailyTotals: readonly AiDailyTotal[];
};

export type DiffSummary = {
    readonly addedCount: number;
    readonly removedCount: number;
    readonly changedCount: number;
};

export type AdminNavTab =
    'configs' | 'wizard' | 'versions' | 'ai-usage' | 'ai-settings' | 'projects';

export type {
    AiPromptsGroup,
    AiConfigPayload,
    TestPromptResponse,
} from './ai-settings-types';

export type {
    AdminProjectPlan,
    AdminProjectItem,
    AdminProjectsResponse,
} from './admin-project-types';

export type AdminViewMode = 'visual' | 'raw';

export type WizardValidationResult = {
    readonly isValid: boolean;
    readonly issues: readonly Issue[];
    readonly parsedConfig: WizardConfig | null;
};
