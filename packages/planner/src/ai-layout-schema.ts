import { z } from 'zod';
import {
    ROOM_TYPES,
    ROOF_KINDS,
    EXTERIOR_WALL_COLORS,
    EXTERIOR_ROOF_COLORS,
    EXTERIOR_ACCENT_COLORS,
} from '@aihome/bdm';
import { FIXTURE_KINDS } from './fixture-catalog.js';

const rectSchema = z.object({
    x: z.number().int().min(0).max(60),
    y: z.number().int().min(0).max(60),
    w: z.number().int().min(1).max(60),
    h: z.number().int().min(1).max(60),
});

const roomSchema = z.object({
    key: z.string().min(1).max(40),
    name: z.string().min(1).max(30),
    type: z.enum(ROOM_TYPES),
    rects: z.array(rectSchema).min(1).max(8),
});

/** The exact wall segment (grid units, same axes as `rects`) a room's door opens through — the
 * AI now owns this directly instead of a blind graph algorithm picking it. */
const doorSchema = z.object({
    room: z.string().min(1).max(40),
    dir: z.enum(['v', 'h']),
    pos: z.number().int().min(0).max(60),
    a: z.number().int().min(0).max(60),
    b: z.number().int().min(0).max(60),
    kind: z.enum(['slide', 'swing']),
});

/** One piece of furniture: the AI picks which, where and which way it faces; its physical size
 * comes from the fixed catalog (`fixture-catalog.ts`), not from the AI. */
const fixtureSchema = z.object({
    room: z.string().min(1).max(40),
    kind: z.enum(FIXTURE_KINDS),
    x: z.number().int().min(0).max(60),
    y: z.number().int().min(0).max(60),
    rotation: z.union([
        z.literal(0),
        z.literal(90),
        z.literal(180),
        z.literal(270),
    ]),
});

/** Exterior window segment on a floor's outer perimeter wall (`x=0`, `x=gridW`, `y=0`, `y=gridD`). */
const windowSchema = z.object({
    room: z.string().min(1).max(40),
    dir: z.enum(['v', 'h']),
    pos: z.number().int().min(0).max(60),
    a: z.number().min(0).max(60),
    b: z.number().min(0).max(60),
    kind: z.enum(['sash', 'window', 'small']),
});

const deckRectSchema = z.object({
    x: z.number().int().min(-10).max(60),
    y: z.number().int().min(-20).max(60),
    w: z.number().int().min(1).max(60),
    h: z.number().int().min(1).max(60),
});

const aiExteriorSchema = z.object({
    roofKind: z.enum(ROOF_KINDS).optional(),
    roofPitch: z.number().min(0).max(8).optional(),
    overhangMm: z.number().int().min(300).max(1200).optional(),
    wallColor: z.enum(EXTERIOR_WALL_COLORS).optional(),
    roofColor: z.enum(EXTERIOR_ROOF_COLORS).optional(),
    accentColor: z.enum(EXTERIOR_ACCENT_COLORS).optional(),
    hasEntranceLattice: z.boolean().optional(),
    parkingSide: z.enum(['left', 'right']).optional(),
    deck: deckRectSchema.optional(),
    trees: z
        .array(
            z.object({
                x: z.number().min(-10).max(60),
                y: z.number().min(-20).max(60),
            }),
        )
        .max(12)
        .optional(),
});

const floorSchema = z.object({
    level: z.number().int().min(1).max(2),
    gridD: z.number().int().min(4).max(40),
    rooms: z.array(roomSchema).min(2).max(32),
    doors: z.array(doorSchema).max(40).optional(),
    fixtures: z.array(fixtureSchema).max(60).optional(),
    windows: z.array(windowSchema).max(40).optional(),
});

export const aiLayoutSchema = z.object({
    reasoning: z
        .object({
            program: z.string().max(600).optional(),
            envelope: z.string().max(1500).optional(),
            zoning: z.string().max(1500).optional(),
            partitions: z.string().max(1500).optional(),
            circulation: z.string().max(600).optional(),
            furniture: z.string().max(1500).optional(),
            exterior: z.string().max(600).optional(),
        })
        .optional(),
    gridW: z.number().int().min(5).max(40),
    floors: z.array(floorSchema).min(1).max(2),
    exterior: aiExteriorSchema.optional(),
});

export type AiLayout = z.infer<typeof aiLayoutSchema>;
export type AiLayoutRoom = z.infer<typeof roomSchema>;
export type AiLayoutDoor = z.infer<typeof doorSchema>;
export type AiLayoutFixture = z.infer<typeof fixtureSchema>;
export type AiLayoutWindow = z.infer<typeof windowSchema>;
export type AiLayoutExterior = z.infer<typeof aiExteriorSchema>;

export function parseAiLayout(raw: unknown): {
    layout?: AiLayout;
    errors: string[];
} {
    const r = aiLayoutSchema.safeParse(raw);
    if (r.success) return { layout: r.data, errors: [] };
    return {
        errors: r.error.issues
            .slice(0, 8)
            .map((i) => `JSON形式エラー ${i.path.join('.')}: ${i.message}`),
    };
}

