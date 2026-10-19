import { type DesignConstraints } from '@aihome/planner';

export function buildLocalConstraints(
    answers: Record<string, unknown>,
): DesignConstraints {
    const isSingleStory = answers.plan_floors === 'one_story';
    const notes: string[] = [
        '南面からの採光確保',
        '水回りの集約による動線短縮',
    ];

    return {
        schemaVersion: 1,
        summary: isSingleStory
            ? '平屋建てで効率的な家事動線と採光を重視した設計要件です。'
            : '明るいLDKと家族の繋がり、十分な収納力を両立させた設計要件です。',
        priorities: {
            housework: 4,
            storage: 4,
            daylight: 4,
            budget: 3,
            privacy: 3,
            family: 5,
        },
        mustHaveRooms: ['LDK', '主寝室', '浴室', '洗面所', 'トイレ', '玄関'],
        avoidRooms: [],
        roomHints: [],
        adjacency: [],
        orientation: {
            livingFacing: 'south',
            entranceSide: 'south',
        },
        accessibility: {
            oneLevelLiving: isSingleStory,
            wideCorridors: false,
        },
        pets: false,
        workFromHome: false,
        notes,
        unmappedRequests: [],
    };
}
