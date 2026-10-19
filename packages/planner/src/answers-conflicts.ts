import { FLOORS_TABLE } from './answers-tables.js';

export type AnswerConflict = {
    readonly code: string;
    /** Japanese, for the AI and the customer */
    readonly message: string;
};

const FLOOR_LABEL: Readonly<Record<string, string>> = {
    one_story: '平屋',
    two_story: '2階建て',
    three_story: '3階建て',
};

/**
 * Answers that contradict each other. The planner reads one of them (e.g. the floor count from
 * the room-planning step); the review uses the other as an allowed fallback and asks the customer.
 */
export function detectAnswerConflicts(
    answers: Record<string, unknown>,
): AnswerConflict[] {
    const out: AnswerConflict[] = [];
    const basic = answers.floors;
    const plan = answers.plan_type;
    if (
        typeof basic === 'string' &&
        typeof plan === 'string' &&
        FLOORS_TABLE[basic] !== undefined &&
        FLOORS_TABLE[plan] !== undefined &&
        FLOORS_TABLE[basic] !== FLOORS_TABLE[plan]
    ) {
        out.push({
            code: 'FLOORS_ANSWERS_DIFFER',
            message: `基本情報では「${FLOOR_LABEL[basic] ?? basic}」、間取りの希望では「${FLOOR_LABEL[plan] ?? plan}」が選ばれています。`,
        });
    }
    return out;
}

/** Whether the customer named both floor counts, so switching between them is not overriding a firm wish. */
export function isFloorsFlexible(
    conflicts: readonly AnswerConflict[],
): boolean {
    return conflicts.some((c) => c.code === 'FLOORS_ANSWERS_DIFFER');
}
