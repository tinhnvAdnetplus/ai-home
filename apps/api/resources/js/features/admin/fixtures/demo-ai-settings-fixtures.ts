import type {
    ConfigDocumentDetail,
    TestPromptResponse,
    AiConfigPayload,
} from '../types/admin-types';

export const demoAiPayload: AiConfigPayload = {
    schemaVersion: 1,
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.2,
    maxTokens: 2048,
    dailyLimit: 50,
    timeoutSeconds: 20,
    isEnabled: true,
    prompts: {
        constraints: {
            ja: '# 住宅設計要件抽出（Design Constraints Extractor）\n\nあなたはお客様のアンケート回答を分析し、厳格なJSONスキーマ形式の設計要件を出力するAI建築士です。\n\n{{answers}}\n\n言語設定: {{locale}}',
            en: 'You are an AI residential architect extracting design constraints from user questionnaire.\n\n{{answers}}\n\nLocale: {{locale}}',
        },
        commentary: {
            ja: '# 住宅プラン提案解説（Plan Commentary Generator）\n\nあなたはお客様に向けて生成されたプランの特徴、長所、留意点を分かりやすく解説するAI建築士です。\n\n{{answers}}',
        },
    },
};

export const demoAiConfigDoc: ConfigDocumentDetail = {
    key: 'ai',
    scope: 'global',
    publishedVersion: {
        id: 10,
        version: 1,
        status: 'published',
        schemaVersion: 1,
        payloadHash: 'hash-ai-v1-published',
        label: 'Default AI Settings v1',
        publishedAt: '2026-10-12T10:00:00Z',
        createdAt: '2026-10-12T09:55:00Z',
        payload: demoAiPayload,
    },
    draftVersion: null,
    recentVersions: [
        {
            id: 10,
            version: 1,
            status: 'published',
            schemaVersion: 1,
            payloadHash: 'hash-ai-v1-published',
            label: 'Default AI Settings v1',
            publishedAt: '2026-10-12T10:00:00Z',
            createdAt: '2026-10-12T09:55:00Z',
        },
    ],
};

export const demoTestPromptResult: TestPromptResponse = {
    output: {
        schemaVersion: 1,
        summary:
            '平屋・収納重視の快適な設計要件です。生活動線と家族の快適性を最優先に計画します。',
        priorities: {
            housework: 5,
            storage: 5,
            daylight: 4,
            budget: 3,
            privacy: 3,
            family: 4,
        },
        mustHaveRooms: ['ldk', 'bedroom', 'entrance', 'bath', 'walkInCloset'],
        avoidRooms: [],
        roomHints: [{ room: 'walkInCloset', count: 1, sizeJo: 3 }],
        adjacency: [{ a: 'kitchen', b: 'laundry', relation: 'near' }],
        orientation: { livingFacing: 'south', entranceSide: 'any' },
        accessibility: { oneLevelLiving: true, wideCorridors: false },
        pets: false,
        workFromHome: true,
        notes: ['大型パントリーおよびWICの確保'],
        unmappedRequests: [],
    },
    isValid: true,
    issues: [],
    usage: {
        inputTokens: 142,
        outputTokens: 88,
    },
    latencyMs: 320,
    source: 'gemini',
};

export const sampleAnswerPresets: readonly {
    readonly id: string;
    readonly label: string;
    readonly answers: Record<string, unknown>;
}[] = [
    {
        id: 'default',
        label: '標準回答（Default）',
        answers: {
            plan_floors: 'one_story',
            budget_range: 'budget_2500_3500',
            plan_ldk_size: 'size_18',
            plan_storage: ['walkin_closet', 'pantry'],
            notes_step1: '平屋が希望。収納をたっぷり確保したい。',
        },
    },
    {
        id: 'preset1',
        label: '平屋・収納・家事ラク（Preset 1）',
        answers: {
            plan_floors: 'one_story',
            budget_range: 'budget_3000_4000',
            plan_storage: ['walkin_closet', 'pantry', 'shoe_closet'],
            life_work: 'dedicated_room',
            notes_step1: '平屋で回遊家事動線と大型パントリー、書斎が欲しい。',
        },
    },
    {
        id: 'preset2',
        label: '2階建て・テレワーク・南向き（Preset 2）',
        answers: {
            plan_floors: 'two_story',
            budget_range: 'budget_3500_4500',
            life_work: 'dedicated_room',
            life_pets: 'dog',
            notes_step1:
                '南向きの明るいLDK、テレワーク専用書斎、ペットと暮らせる設計。',
        },
    },
];
