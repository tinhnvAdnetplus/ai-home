import { describe, it, expect } from 'vitest';
import {
    VARIANTS,
    checkAiLayout,
    defaultPlannerConfig,
    mapAnswersToPlanInput,
    parseAiLayout,
    planFromAiLayout,
} from '@aihome/planner';
import { mirrorModelY } from '@/features/plan/lib/mirror-model';

const sampleAnswers = {
    floors: 1,
    ldkJo: 16,
    bedroomCount: 1,
    landTsubo: 55,
    frontageM: 13,
    depthM: 14,
    parkingSpaces: 1,
};

const sampleAiLayout = {
    reasoning: {
        program: '1F compact plan',
        zoning: 'South LDK, North private',
        circulation: 'Entrance -> Hall -> LDK / Wet / Bedroom',
        exterior: 'Shed roof with south wood deck and garden trees',
    },
    gridW: 8,
    floors: [
        {
            level: 1,
            gridD: 6,
            rooms: [
                {
                    type: 'entrance',
                    key: 'entrance',
                    name: '玄関',
                    rects: [{ x: 0, y: 0, w: 2, h: 2 }],
                },
                {
                    type: 'ldk',
                    key: 'ldk',
                    name: 'LDK',
                    rects: [{ x: 2, y: 0, w: 6, h: 4 }],
                },
                {
                    type: 'hall',
                    key: 'hall',
                    name: 'ホール',
                    rects: [{ x: 0, y: 2, w: 2, h: 2 }],
                },
                {
                    type: 'toilet',
                    key: 'toilet',
                    name: 'トイレ',
                    rects: [{ x: 0, y: 4, w: 2, h: 1 }],
                },
                {
                    type: 'storage',
                    key: 'storage',
                    name: '収納',
                    rects: [{ x: 0, y: 5, w: 2, h: 1 }],
                },
                {
                    type: 'wash',
                    key: 'wash',
                    name: '洗面室',
                    rects: [{ x: 2, y: 4, w: 2, h: 2 }],
                },
                {
                    type: 'bath',
                    key: 'bath',
                    name: '浴室',
                    rects: [{ x: 4, y: 4, w: 2, h: 2 }],
                },
                {
                    type: 'bedroom',
                    key: 'master',
                    name: '主寝室',
                    rects: [{ x: 6, y: 4, w: 2, h: 2 }],
                },
            ],
            doors: [
                {
                    room: 'entrance',
                    dir: 'h',
                    pos: 2,
                    a: 0,
                    b: 1,
                    kind: 'swing',
                },
                { room: 'hall', dir: 'v', pos: 2, a: 2, b: 3, kind: 'swing' },
                { room: 'toilet', dir: 'h', pos: 4, a: 0, b: 1, kind: 'swing' },
                {
                    room: 'storage',
                    dir: 'v',
                    pos: 2,
                    a: 5,
                    b: 6,
                    kind: 'slide',
                },
                { room: 'wash', dir: 'h', pos: 4, a: 2, b: 3, kind: 'slide' },
                { room: 'bath', dir: 'v', pos: 4, a: 4, b: 5, kind: 'slide' },
                { room: 'master', dir: 'h', pos: 4, a: 6, b: 7, kind: 'swing' },
            ],
            windows: [
                { room: 'ldk', dir: 'h', pos: 0, a: 3, b: 5, kind: 'sash' },
                { room: 'ldk', dir: 'v', pos: 8, a: 1, b: 2, kind: 'window' },
                { room: 'bath', dir: 'h', pos: 6, a: 4, b: 5, kind: 'small' },
            ],
        },
    ],
    exterior: {
        roofKind: 'shed',
        roofPitch: 2.5,
        overhangMm: 500,
        wallColor: 'beige',
        roofColor: 'black',
        accentColor: 'wood',
        hasEntranceLattice: true,
        parkingSide: 'left',
        deck: { x: 2, y: -2, w: 4, h: 2 },
        trees: [
            { x: 7, y: -1 },
            { x: 3, y: 7 },
        ],
    },
};

describe('AI exterior design & BDM integration', () => {
    it('validates AI windows and exterior landscaping and converts to BDM', () => {
        const input = { ...mapAnswersToPlanInput(sampleAnswers).input, floors: 1 as const };
        const variant = VARIANTS[0];
        expect(variant).toBeDefined();
        if (!variant) return;

        const parsed = parseAiLayout(sampleAiLayout);
        expect(parsed.errors).toEqual([]);
        expect(parsed.layout).toBeDefined();
        if (!parsed.layout) return;

        const issues = checkAiLayout(parsed.layout, input, {
            shouldRequireDoors: true,
        });
        expect(issues).toEqual([]);

        const aiPlan = planFromAiLayout(
            input,
            parsed.layout,
            variant,
            defaultPlannerConfig,
            42,
        );

        expect(aiPlan.model.roof.kind).toBe('shed');
        expect(aiPlan.model.roof.pitch).toBe(2.5);
        expect(aiPlan.model.roof.overhangMm).toBe(500);
        expect(aiPlan.model.exterior?.wallColor).toBe('beige');
        expect(aiPlan.model.exterior?.roofColor).toBe('black');
        expect(aiPlan.model.exterior?.accentColor).toBe('wood');
        expect(aiPlan.model.exterior?.deckPolygon?.length).toBe(4);
        expect(aiPlan.model.exterior?.approachPolygon?.length).toBe(4);
        expect(aiPlan.model.exterior?.trees?.length).toBe(2);
        expect(aiPlan.model.parking.polygon?.length).toBe(4);

        const mirrored = mirrorModelY(aiPlan.model);
        expect(mirrored.exterior?.deckPolygon?.length).toBe(4);
        expect(mirrored.exterior?.trees?.length).toBe(2);
        expect(mirrored.parking.polygon?.length).toBe(4);
    });

    it('rejects exterior deck or trees that overlap the 1F building footprint', () => {
        const input = { ...mapAnswersToPlanInput(sampleAnswers).input, floors: 1 as const };
        const parsed = parseAiLayout({
            ...sampleAiLayout,
            exterior: {
                ...sampleAiLayout.exterior,
                deck: { x: 2, y: 0, w: 3, h: 2 },
                trees: [{ x: 3, y: 2 }],
            },
        });
        expect(parsed.layout).toBeDefined();
        if (!parsed.layout) return;

        const issues = checkAiLayout(parsed.layout, input);
        expect(issues.some((msg) => msg.includes('exterior.deck'))).toBe(true);
        expect(issues.some((msg) => msg.includes('exterior.trees'))).toBe(true);
    });
});
