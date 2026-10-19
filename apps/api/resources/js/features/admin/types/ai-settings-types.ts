export type AiPromptsGroup = {
    readonly ja: string;
    readonly en?: string | undefined;
    readonly vi?: string | undefined;
};

export type AiConfigPayload = {
    readonly schemaVersion?: number | undefined;
    readonly provider: 'gemini' | 'claude' | 'local';
    readonly model: string;
    readonly temperature: number;
    readonly maxTokens: number;
    readonly dailyLimit: number;
    readonly timeoutSeconds: number;
    readonly isEnabled: boolean;
    readonly prompts: {
        readonly constraints: AiPromptsGroup;
        readonly commentary: AiPromptsGroup;
    };
};

export type TestPromptResponse = {
    readonly output: Record<string, unknown>;
    readonly isValid: boolean;
    readonly issues: readonly string[];
    readonly usage: {
        readonly inputTokens: number;
        readonly outputTokens: number;
    };
    readonly latencyMs: number;
    readonly source: string;
};
