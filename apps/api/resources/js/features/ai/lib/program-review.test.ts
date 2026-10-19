import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mapAnswersToPlanInput } from '@aihome/planner';
import { reviewProgram } from './program-review';
import { fetchAiBrief, type AiBrief } from './ai-brief-client';

vi.mock('./ai-brief-client', () => ({ fetchAiBrief: vi.fn() }));
const fetchMock = vi.mocked(fetchAiBrief);

const base = {
    plan_type: 'two_story',
    plan_ldk_size: 'size_18',
    plan_kids_room_count: 'count_2',
    plan_parking_count: 'cars_2',
    plan_parking_options: ['carport'],
    road_side: 'south',
};
const inputFor = (lot: Record<string, unknown>) =>
    mapAnswersToPlanInput({ ...base, ...lot }).input;

function brief(adjustments: AiBrief['adjustments']): AiBrief {
    return {
        summary: 'まとめ',
        adjustments,
        suggestions: ['南面に大開口'],
        questions: [],
    };
}

describe('reviewProgram', () => {
    beforeEach(() => {
        fetchMock.mockReset();
    });

    it('keeps a program that already fits and only asks the AI for advice', async () => {
        fetchMock.mockResolvedValue(brief([]));
        const r = await reviewProgram({
            input: inputFor({ frontage: 12, depth: 14, land_area: 50 }),
            isAiEnabled: true,
        });
        expect(r.isFeasible).toBe(true);
        expect(r.adjustments).toHaveLength(0);
        expect(r.suggestions).toEqual(['南面に大開口']);
    });

    it('applies the AI change that makes the house fit, and nothing else', async () => {
        fetchMock.mockResolvedValue(
            brief([
                {
                    action: 'set',
                    field: 'floors',
                    value: '2',
                    wish: '平屋',
                    reason: '建ぺい率に収まらないため2階建てにしました。',
                },
            ]),
        );
        const r = await reviewProgram({
            input: inputFor({
                frontage: 10,
                depth: 14,
                land_area: 42,
                plan_type: 'one_story',
            }),
            isAiEnabled: true,
        });
        expect(r.isFeasible).toBe(true);
        expect(r.source).toBe('ai');
        expect(r.overrides.floors).toBe(2);
        expect(r.adjustments.map((a) => a.field)).toEqual(['floors']);
    });

    it('refuses an AI change that does not help and lets the measured rules finish', async () => {
        fetchMock.mockResolvedValue(
            brief([
                {
                    action: 'set',
                    field: 'masterSize',
                    value: '6',
                    wish: '主寝室8帖',
                    reason: '縮めました。',
                },
            ]),
        );
        const r = await reviewProgram({
            input: inputFor({
                frontage: 10,
                depth: 14,
                land_area: 42,
                plan_type: 'one_story',
            }),
            isAiEnabled: true,
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(r.isFeasible).toBe(true);
        expect(r.source).toBe('rule');
        expect(r.overrides.masterSize).toBeUndefined();
    });

    it('never takes a reduction when the program already fits', async () => {
        fetchMock.mockResolvedValue(
            brief([
                {
                    action: 'set',
                    field: 'kidsRooms',
                    value: '1',
                    wish: '子ども部屋2室',
                    reason: '減らしました。',
                },
                {
                    action: 'add',
                    field: 'storageOpts',
                    value: 'ファミリークローゼット',
                    wish: '収納',
                    reason: '追加しました。',
                },
            ]),
        );
        const r = await reviewProgram({
            input: inputFor({ frontage: 12, depth: 14, land_area: 50 }),
            isAiEnabled: true,
        });
        expect(r.isFeasible).toBe(true);
        expect(r.overrides.kidsRooms).toBeUndefined();
        expect(r.adjustments.map((a) => a.action)).toEqual(['add']);
    });

    it('falls back to the rules when the AI is unavailable', async () => {
        fetchMock.mockResolvedValue(null);
        const r = await reviewProgram({
            input: inputFor({
                frontage: 10,
                depth: 14,
                land_area: 42,
                plan_type: 'one_story',
            }),
            isAiEnabled: true,
        });
        expect(r.isFeasible).toBe(true);
        expect(r.source).toBe('rule');
        expect(r.overrides.floors).toBe(2);
    });

    it('marks a lot too small for any house as blocked and corrects the land area', async () => {
        fetchMock.mockResolvedValue(brief([]));
        const r = await reviewProgram({
            input: inputFor({ frontage: 15, depth: 4, land_area: 60 }),
            isAiEnabled: true,
        });
        expect(r.isBlocked).toBe(true);
        expect(r.issues.some((i) => i.code === 'LOT_TOO_SMALL')).toBe(true);
        expect(r.adjustments.map((a) => a.source)).toEqual(['input']);
    });
});
