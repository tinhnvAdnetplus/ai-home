import { type BdmIssue } from './types.js';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_FLOORS = 10;
const MAX_ROOMS_PER_FLOOR = 100;
const MAX_WALLS_PER_FLOOR = 500;
const MAX_OPENINGS_PER_FLOOR = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasForbiddenKey(obj: Record<string, unknown>): boolean {
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (FORBIDDEN_KEYS.has(key)) {
            return true;
        }
    }
    return false;
}

export function precheckBdmLimits(input: unknown): readonly BdmIssue[] {
    if (!isRecord(input)) {
        return [];
    }

    if (hasForbiddenKey(input)) {
        return [
            {
                path: [],
                code: 'FORBIDDEN_PROPERTY',
                message: 'Input contains forbidden prototype pollution key',
            },
        ];
    }

    const floors = input.floors;
    if (!Array.isArray(floors)) {
        return [];
    }

    if (floors.length > MAX_FLOORS) {
        return [
            {
                path: ['floors'],
                code: 'LIMIT_EXCEEDED',
                message: `Floor count ${floors.length.toString()} exceeds maximum ${MAX_FLOORS.toString()}`,
            },
        ];
    }

    for (const [floorIndex, floor] of floors.entries()) {
        if (!isRecord(floor)) {
            continue;
        }
        if (hasForbiddenKey(floor)) {
            return [
                {
                    path: ['floors', floorIndex],
                    code: 'FORBIDDEN_PROPERTY',
                    message: 'Floor contains forbidden prototype pollution key',
                },
            ];
        }

        if (
            Array.isArray(floor.rooms) &&
            floor.rooms.length > MAX_ROOMS_PER_FLOOR
        ) {
            return [
                {
                    path: ['floors', floorIndex, 'rooms'],
                    code: 'LIMIT_EXCEEDED',
                    message: `Room count exceeds maximum ${MAX_ROOMS_PER_FLOOR.toString()}`,
                },
            ];
        }

        if (
            Array.isArray(floor.walls) &&
            floor.walls.length > MAX_WALLS_PER_FLOOR
        ) {
            return [
                {
                    path: ['floors', floorIndex, 'walls'],
                    code: 'LIMIT_EXCEEDED',
                    message: `Wall count exceeds maximum ${MAX_WALLS_PER_FLOOR.toString()}`,
                },
            ];
        }

        if (
            Array.isArray(floor.openings) &&
            floor.openings.length > MAX_OPENINGS_PER_FLOOR
        ) {
            return [
                {
                    path: ['floors', floorIndex, 'openings'],
                    code: 'LIMIT_EXCEEDED',
                    message: `Opening count exceeds maximum ${MAX_OPENINGS_PER_FLOOR.toString()}`,
                },
            ];
        }
    }

    return [];
}
