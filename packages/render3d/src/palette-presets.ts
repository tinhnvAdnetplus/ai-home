import {
    type ArchitecturalPalette,
    type ArchitecturalStyle,
    type SurfaceSpec,
} from './palette.js';

/** Style presets of the semantic palette (see palette.ts for resolution rules). */

export type Preset = Omit<ArchitecturalPalette, 'style'>;

export const surface = (
    color: string,
    roughness: number,
    metalness = 0,
): SurfaceSpec => ({
    color,
    roughness,
    metalness,
});

const s = surface;

// Shared, style-independent physical defaults.
const FOUNDATION = s('#bdbbb5', 0.92);
const GLAZING = { ...s('#7f97a3', 0.06, 0), opacity: 0.5 };
const METAL = s('#a7adb3', 0.35, 0.3);
const FLOOR = s('#c9a678', 0.45, 0.02);

export const PRESETS: Readonly<Record<ArchitecturalStyle, Preset>> = {
    // Warm off-white panel facade, graphite metal roof, dark aluminium frames, walnut door.
    modern: {
        wallFinish: 'siding',
        roofFinish: 'metal',
        wall: s('#e8e5de', 0.8),
        wallAccent: s('#8d8a84', 0.78),
        roof: s('#3a3d42', 0.5, 0.15),
        trim: s('#2f3236', 0.55, 0.1),
        foundation: FOUNDATION,
        windowFrame: s('#3d4044', 0.4, 0.2),
        glazing: GLAZING,
        entranceDoor: s('#5a4637', 0.55),
        interiorDoor: s('#b08a62', 0.6),
        timber: s('#a77a52', 0.62),
        floor: FLOOR,
        metal: METAL,
    },
    // Soft plaster walls, dark slate roof, restrained timber, bronze frames.
    'japanese-modern': {
        wallFinish: 'render',
        roofFinish: 'slate',
        wall: s('#e3dccf', 0.9),
        wallAccent: s('#9b7552', 0.66),
        roof: s('#3b3d40', 0.7, 0.05),
        trim: s('#34312d', 0.6, 0.05),
        foundation: FOUNDATION,
        windowFrame: s('#4b463f', 0.45, 0.15),
        glazing: GLAZING,
        entranceDoor: s('#6b4e36', 0.58),
        interiorDoor: s('#b48d63', 0.6),
        timber: s('#9b7552', 0.64),
        floor: FLOOR,
        metal: METAL,
    },
    // Cream plaster, brown slate roof, light oak, white frames.
    natural: {
        wallFinish: 'render',
        roofFinish: 'slate',
        wall: s('#eee6d7', 0.9),
        wallAccent: s('#b68b60', 0.64),
        roof: s('#5a4c42', 0.72, 0.04),
        trim: s('#5b4838', 0.62, 0.04),
        foundation: FOUNDATION,
        windowFrame: s('#efece5', 0.4, 0.05),
        glazing: GLAZING,
        entranceDoor: s('#8a6542', 0.58),
        interiorDoor: s('#c09a6e', 0.6),
        timber: s('#b68b60', 0.64),
        floor: FLOOR,
        metal: METAL,
    },
    // Warm stucco, terracotta barrel tile, ivory frames, dark oak door.
    'south-european': {
        wallFinish: 'render',
        roofFinish: 'tile',
        wall: s('#efe2ca', 0.92),
        wallAccent: s('#c3a07b', 0.7),
        roof: s('#a65f3e', 0.78),
        trim: s('#7a5a43', 0.65),
        foundation: FOUNDATION,
        windowFrame: s('#f1ede4', 0.4, 0.05),
        glazing: GLAZING,
        entranceDoor: s('#7b4f34', 0.58),
        interiorDoor: s('#b58a60', 0.6),
        timber: s('#a47148', 0.64),
        floor: FLOOR,
        metal: METAL,
    },
};
