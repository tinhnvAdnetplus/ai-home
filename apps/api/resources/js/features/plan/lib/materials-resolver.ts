import { type Exterior } from '@aihome/bdm';
import { type MaterialOptions } from '@aihome/render3d';

const WALL_COLORS: Readonly<Record<string, string>> = {
    white: '#f4f3ef',
    beige: '#e8dfd1',
    gray: '#8c929a',
    brown: '#6b4c35',
    black: '#2b2b2b',
    navy: '#1f2e4d',
    other: '#f4f3ef',
};

const ROOF_COLORS: Readonly<Record<string, string>> = {
    black: '#2b2b2b',
    gray: '#5a626a',
    brown: '#5c4033',
    navy: '#1f2e4d',
    green: '#2e4d36',
    other: '#37415a',
};

const ACCENT_COLORS: Readonly<Record<string, string>> = {
    wood: '#c48950',
    white: '#f4f3ef',
    beige: '#e8dfd1',
    gray: '#7b828a',
    brown: '#6b4c35',
    black: '#2b2b2b',
};

const FLOOR_COLORS: Readonly<Record<string, string>> = {
    natural: '#c9a678',
    dark: '#5c3d26',
    gray: '#9e9e9e',
    tile: '#e0e0e0',
};

function extractFirstString(val: unknown): string | undefined {
    if (typeof val === 'string' && val.length > 0) return val;
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
        return val[0];
    }
    return undefined;
}

export function resolveMaterialsFromAnswers(
    answers: Record<string, unknown>,
    exterior?: Exterior,
): MaterialOptions {
    const rawWall =
        exterior?.wallColor ??
        extractFirstString(answers.design_exterior_wall_color);
    const rawRoof =
        exterior?.roofColor ?? extractFirstString(answers.design_roof_color);
    const rawFloor = extractFirstString(answers.design_flooring_material);
    const rawAccent = exterior?.accentColor;

    const wall = rawWall ? (WALL_COLORS[rawWall] ?? '#f4f3ef') : undefined;
    const roof = rawRoof ? (ROOF_COLORS[rawRoof] ?? '#37415a') : undefined;
    const floor = rawFloor ? (FLOOR_COLORS[rawFloor] ?? '#c9a678') : undefined;
    const accent = rawAccent ? ACCENT_COLORS[rawAccent] : undefined;

    return { wall, roof, floor, accent };
}
