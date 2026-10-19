import { z } from 'zod';

export const COMPASS_DIRECTION_SCHEMA = z.enum([
    'north',
    'south',
    'east',
    'west',
    'any',
]);
export type CompassDirection = z.infer<typeof COMPASS_DIRECTION_SCHEMA>;

export const ADJACENCY_RELATION_SCHEMA = z.enum(['near', 'far', 'adjacent']);
export type AdjacencyRelation = z.infer<typeof ADJACENCY_RELATION_SCHEMA>;

export const PrioritiesSchema = z.object({
    housework: z.number().int().min(0).max(5),
    storage: z.number().int().min(0).max(5),
    daylight: z.number().int().min(0).max(5),
    budget: z.number().int().min(0).max(5),
    privacy: z.number().int().min(0).max(5),
    family: z.number().int().min(0).max(5),
});
export type Priorities = z.infer<typeof PrioritiesSchema>;

export const RoomHintSchema = z.object({
    room: z.string().min(1),
    count: z.number().int().min(0).max(6).optional(),
    sizeJo: z.number().min(3).max(40).optional(),
});
export type RoomHint = z.infer<typeof RoomHintSchema>;

export const AdjacencySchema = z.object({
    a: z.string().min(1),
    b: z.string().min(1),
    relation: ADJACENCY_RELATION_SCHEMA,
});
export type Adjacency = z.infer<typeof AdjacencySchema>;

export const OrientationSchema = z.object({
    livingFacing: COMPASS_DIRECTION_SCHEMA,
    entranceSide: COMPASS_DIRECTION_SCHEMA,
});
export type Orientation = z.infer<typeof OrientationSchema>;

export const AccessibilitySchema = z.object({
    oneLevelLiving: z.boolean(),
    wideCorridors: z.boolean(),
});
export type Accessibility = z.infer<typeof AccessibilitySchema>;

export const DesignConstraintsSchema = z.object({
    schemaVersion: z.literal(1),
    summary: z.string().max(200),
    priorities: PrioritiesSchema,
    mustHaveRooms: z.array(z.string().min(1)),
    avoidRooms: z.array(z.string().min(1)),
    roomHints: z.array(RoomHintSchema),
    adjacency: z.array(AdjacencySchema).max(8),
    orientation: OrientationSchema,
    accessibility: AccessibilitySchema,
    pets: z.boolean(),
    workFromHome: z.boolean(),
    notes: z.array(z.string().max(80)).max(6),
    unmappedRequests: z.array(z.string().max(120)).max(6),
});

export type DesignConstraints = z.infer<typeof DesignConstraintsSchema>;
