/** Small sRGB hex helpers for palette derivation (no THREE dependency, deterministic). */

function hexToRgb(hex: string): [number, number, number] | null {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m?.[1]) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
    const c = (v: number): string =>
        Math.max(0, Math.min(255, Math.round(v)))
            .toString(16)
            .padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
}

/** Relative luminance-ish lightness 0..1 (sRGB average, good enough for palette decisions). */
export function lightness(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0.5;
    return (rgb[0] + rgb[1] + rgb[2]) / (3 * 255);
}

/** Mix `hex` towards black (factor < 1) or white (factor > 1). */
export function shade(hex: string, factor: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    if (factor <= 1)
        return rgbToHex([rgb[0] * factor, rgb[1] * factor, rgb[2] * factor]);
    const t = Math.min(1, factor - 1);
    return rgbToHex([
        rgb[0] + (255 - rgb[0]) * t,
        rgb[1] + (255 - rgb[1]) * t,
        rgb[2] + (255 - rgb[2]) * t,
    ]);
}
