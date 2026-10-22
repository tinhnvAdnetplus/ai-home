import { lightness, shade } from './color-utils.js';
import { PRESETS, surface as s } from './palette-presets.js';
import { type MaterialOptions } from './types.js';

/**
 * Semantic architectural palette. Colour/finish selection lives here and ONLY here: geometry
 * builders ask the registry for a role (`wallExterior`, `roof`, `frame`, ...) and never pick a
 * colour themselves, and nothing in geometry or validation depends on these values.
 *
 * Resolution is deterministic: style preset -> explicit user choices (MaterialOptions hex
 * values) override their slot verbatim -> a few slots are derived from the user's choice so the
 * set stays coherent (e.g. trim follows the chosen roof). No randomness, so identical input
 * always renders identically and every floor/object reuses the same materials.
 */
export const ARCHITECTURAL_STYLES = [
    'modern',
    'japanese-modern',
    'natural',
    'south-european',
] as const;
export type ArchitecturalStyle = (typeof ARCHITECTURAL_STYLES)[number];

/** Exterior wall finish: siding = fine-ribbed panel, render = plaster / stucco. */
export type WallFinish = 'siding' | 'render';
/** Roof finish: metal = standing seam, slate = flat cement slate, tile = clay barrel tile. */
export type RoofFinish = 'metal' | 'slate' | 'tile';

export type SurfaceSpec = {
    readonly color: string;
    readonly roughness: number;
    readonly metalness: number;
};

export type ArchitecturalPalette = {
    readonly style: ArchitecturalStyle;
    readonly wallFinish: WallFinish;
    readonly roofFinish: RoofFinish;
    readonly wall: SurfaceSpec;
    readonly wallAccent: SurfaceSpec;
    readonly roof: SurfaceSpec;
    /** Fascia, barge boards, belt line, parapet cap. */
    readonly trim: SurfaceSpec;
    readonly foundation: SurfaceSpec;
    readonly windowFrame: SurfaceSpec;
    readonly glazing: SurfaceSpec & { readonly opacity: number };
    readonly entranceDoor: SurfaceSpec;
    readonly interiorDoor: SurfaceSpec;
    readonly timber: SurfaceSpec;
    readonly floor: SurfaceSpec;
    readonly metal: SurfaceSpec;
};

export { lightness, shade };

export const DEFAULT_ARCHITECTURAL_STYLE: ArchitecturalStyle = 'modern';

/** Planner/wizard style labels (JA, as produced by `mapAnswersToPlanInput`) or raw answer ids. */
export function styleFromLabel(label: string | undefined): ArchitecturalStyle {
    if (!label) return DEFAULT_ARCHITECTURAL_STYLE;
    if (label.includes('和') || label.includes('wa')) return 'japanese-modern';
    if (label.includes('ナチュラル') || label.includes('natural'))
        return 'natural';
    if (label.includes('南欧') || label.includes('western'))
        return 'south-european';
    return DEFAULT_ARCHITECTURAL_STYLE;
}

export function resolvePalette(
    options?: MaterialOptions,
): ArchitecturalPalette {
    const style = options?.style ?? DEFAULT_ARCHITECTURAL_STYLE;
    const p = PRESETS[style];
    const wallHex = options?.wall;
    const roofHex = options?.roof;
    // Explicit choices are used verbatim (never re-tinted).
    const wall = wallHex ? { ...p.wall, color: wallHex } : p.wall;
    const wallAccent = options?.accent
        ? { ...p.wallAccent, color: options.accent }
        : wallHex
          ? // keep a chosen facade colour coherent: accent is the same hue, a step lighter
            // (or darker for an already light wall) instead of an unrelated preset colour
            {
                ...p.wallAccent,
                color:
                    lightness(wallHex) > 0.7
                        ? shade(wallHex, 0.82)
                        : shade(wallHex, 1.18),
            }
          : p.wallAccent;
    const roof = roofHex ? { ...p.roof, color: roofHex } : p.roof;
    // Trim follows the roof it finishes, so a chosen roof colour never clashes with a preset fascia.
    const trim = roofHex ? { ...p.trim, color: shade(roofHex, 0.82) } : p.trim;
    // Frames contrast with the wall: dark aluminium on light walls, light frames on dark walls.
    const windowFrame =
        wallHex && lightness(wallHex) < 0.35
            ? s('#d9d8d3', 0.4, 0.1)
            : p.windowFrame;
    const floor = options?.floor
        ? { ...p.floor, color: options.floor }
        : p.floor;
    return { ...p, style, wall, wallAccent, roof, trim, windowFrame, floor };
}
