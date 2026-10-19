import { z } from 'zod';
import {
    ROOM_TYPES,
    WALL_KINDS,
    OPENING_KINDS,
    ROOF_KINDS,
    PARKING_KINDS,
    ROAD_SIDES,
    EXTERIOR_WALL_COLORS,
    EXTERIOR_ROOF_COLORS,
    EXTERIOR_ACCENT_COLORS,
} from './element-types.js';

export const pointSchema = z.object({
    x: z.number().int(),
    y: z.number().int(),
});

export const polygonSchema = z.array(pointSchema).min(3);

export const roomSchema = z.object({
    id: z.string().min(1),
    type: z.enum(ROOM_TYPES),
    name: z.string().min(1),
    polygon: polygonSchema,
    areaM2: z.number().positive(),
});

export const wallSchema = z.object({
    id: z.string().min(1),
    a: pointSchema,
    b: pointSchema,
    thicknessMm: z.number().int().positive(),
    kind: z.enum(WALL_KINDS),
});

export const openingSchema = z.object({
    id: z.string().min(1),
    wallId: z.string().min(1),
    offsetMm: z.number().int().nonnegative(),
    widthMm: z.number().int().positive(),
    heightMm: z.number().int().positive(),
    sillMm: z.number().int().nonnegative(),
    kind: z.enum(OPENING_KINDS),
});

export const fixtureSchema = z.object({
    id: z.string().min(1),
    kind: z.string().min(1),
    pos: pointSchema,
    rotation: z.number(),
});

export const stairSchema = z.object({
    id: z.string().min(1),
    polygon: polygonSchema,
    direction: z.string().min(1),
    steps: z.number().int().positive(),
    upFloor: z.number().int(),
    downFloor: z.number().int(),
});

export const floorSchema = z.object({
    level: z.number().int(),
    elevationMm: z.number().int().nonnegative(),
    heightMm: z.number().int().positive(),
    rooms: z.array(roomSchema),
    walls: z.array(wallSchema),
    openings: z.array(openingSchema),
    fixtures: z.array(fixtureSchema),
    stairs: z.array(stairSchema),
});

export const siteRoadSchema = z.object({
    side: z.enum(ROAD_SIDES),
    widthMm: z.number().int().positive(),
});

export const siteSetbacksSchema = z.object({
    frontMm: z.number().int().nonnegative(),
    rearMm: z.number().int().nonnegative(),
    leftMm: z.number().int().nonnegative(),
    rightMm: z.number().int().nonnegative(),
});

export const siteSchema = z.object({
    boundary: polygonSchema,
    areaM2: z.number().positive(),
    road: siteRoadSchema,
    setbacks: siteSetbacksSchema,
});

export const roofSchema = z.object({
    kind: z.enum(ROOF_KINDS),
    pitch: z.number().nonnegative(),
    overhangMm: z.number().int().nonnegative(),
});

export const parkingSchema = z.object({
    spaces: z.number().int().nonnegative(),
    kind: z.enum(PARKING_KINDS),
    polygon: polygonSchema.optional(),
});

export const siteTreeSchema = z.object({
    pos: pointSchema,
    radiusMm: z.number().int().positive(),
});

export const exteriorSchema = z.object({
    wallColor: z.enum(EXTERIOR_WALL_COLORS).optional(),
    roofColor: z.enum(EXTERIOR_ROOF_COLORS).optional(),
    accentColor: z.enum(EXTERIOR_ACCENT_COLORS).optional(),
    hasEntranceLattice: z.boolean().optional(),
    deckPolygon: polygonSchema.optional(),
    approachPolygon: polygonSchema.optional(),
    trees: z.array(siteTreeSchema).max(24).optional(),
});

export const modelMetaSchema = z.object({
    generator: z.string().min(1),
    seed: z.number().int(),
    inputHash: z.string().min(1),
});

export const bdmIssueSchema = z.object({
    path: z.array(z.union([z.string(), z.number()])),
    code: z.string().min(1),
    message: z.string(),
    level: z.enum(['info', 'warn', 'error']).optional(),
});

export const buildingModelSchema = z.object({
    schemaVersion: z.literal(1),
    meta: modelMetaSchema,
    site: siteSchema,
    floors: z.array(floorSchema).min(1),
    roof: roofSchema,
    parking: parkingSchema,
    exterior: exteriorSchema.optional(),
    warnings: z.array(bdmIssueSchema),
});

