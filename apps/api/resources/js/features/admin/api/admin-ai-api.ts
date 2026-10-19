import type {
    ConfigDocumentDetail,
    TestPromptResponse,
} from '../types/admin-types';
import {
    demoAiConfigDoc,
    demoTestPromptResult,
} from '../fixtures/demo-ai-settings-fixtures';
import { requestAdmin, isDemoMode } from './admin-http';
import { configDocumentDetailSchema } from '../schemas/admin-schemas';
import { testPromptResponseSchema } from '../schemas/admin-ai-schemas';

export async function fetchAiConfigDoc(): Promise<ConfigDocumentDetail> {
    if (isDemoMode()) {
        return demoAiConfigDoc;
    }
    const raw = await requestAdmin('/api/v1/admin/configs/ai');
    return configDocumentDetailSchema.parse(raw);
}

export async function testAiPrompt(params: {
    readonly which: 'constraints' | 'commentary';
    readonly prompt?: string | undefined;
    readonly answers: Record<string, unknown>;
}): Promise<TestPromptResponse> {
    if (isDemoMode()) {
        return demoTestPromptResult;
    }
    const raw = await requestAdmin('/api/v1/admin/ai/test-prompt', {
        method: 'POST',
        body: JSON.stringify(params),
    });
    return testPromptResponseSchema.parse(raw);
}
