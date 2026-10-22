import * as THREE from 'three';
import { type ArchitecturalPalette } from './palette.js';
import {
    createFallbackTexture,
    createRoofStandingSeamTexture,
    createSidingTexture,
} from './textures.js';

/** Small deterministic PRNG (mulberry32) so procedural textures are identical on every render. */
function seededRandom(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function finishCanvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

/**
 * Plaster / stucco render: near-white with low-contrast trowel mottling, so the wall's base
 * colour carries the finish and the surface still reads as a material, not flat paint. Tiles
 * seamlessly (blotches are wrapped across the edges).
 */
export function createRenderTexture(): THREE.CanvasTexture | THREE.Texture {
    if (typeof document === 'undefined') return createFallbackTexture();
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);
    ctx.fillStyle = '#f4f3f0';
    ctx.fillRect(0, 0, 256, 256);
    const rnd = seededRandom(0x5eed01);
    for (let i = 0; i < 220; i += 1) {
        const x = rnd() * 256;
        const y = rnd() * 256;
        const r = 6 + rnd() * 22;
        const isDark = rnd() < 0.5;
        const alpha = 0.025 + rnd() * 0.035;
        for (const [ox, oy] of [
            [0, 0],
            [-256, 0],
            [256, 0],
            [0, -256],
            [0, 256],
        ] as const) {
            const g = ctx.createRadialGradient(
                x + ox,
                y + oy,
                0,
                x + ox,
                y + oy,
                r,
            );
            const c = isDark ? '0,0,0' : '255,255,255';
            g.addColorStop(0, `rgba(${c},${alpha.toFixed(3)})`);
            g.addColorStop(1, `rgba(${c},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(x + ox - r, y + oy - r, 2 * r, 2 * r);
        }
    }
    return finishCanvasTexture(canvas);
}

/** Flat cement slate (コロニアル): staggered courses with fine shadow lines. */
export function createSlateTexture(): THREE.CanvasTexture | THREE.Texture {
    if (typeof document === 'undefined') return createFallbackTexture();
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);
    ctx.fillStyle = '#e9e9e9';
    ctx.fillRect(0, 0, 256, 256);
    const rnd = seededRandom(0x5eed02);
    const rows = 8;
    const rowH = 256 / rows;
    const cols = 4;
    const colW = 256 / cols;
    for (let r = 0; r < rows; r += 1) {
        const y = r * rowH;
        const offset = r % 2 === 0 ? 0 : colW / 2;
        for (let c = -1; c <= cols; c += 1) {
            const x = c * colW + offset;
            const v = 225 + Math.round(rnd() * 22);
            ctx.fillStyle = `rgb(${v.toString()},${v.toString()},${v.toString()})`;
            ctx.fillRect(x + 1, y + 1, colW - 2, rowH - 2);
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.fillRect(x, y, 1.5, rowH);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(0, y + rowH - 2.5, 256, 2.5);
    }
    return finishCanvasTexture(canvas);
}

/** Clay barrel tile (S瓦): rounded vertical ridges with course shadows. */
export function createClayTileTexture(): THREE.CanvasTexture | THREE.Texture {
    if (typeof document === 'undefined') return createFallbackTexture();
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);
    const rnd = seededRandom(0x5eed03);
    const cols = 4;
    const colW = 256 / cols;
    for (let c = 0; c < cols; c += 1) {
        const x = c * colW;
        const g = ctx.createLinearGradient(x, 0, x + colW, 0);
        g.addColorStop(0, '#c9c9c9');
        g.addColorStop(0.5, '#ffffff');
        g.addColorStop(1, '#bdbdbd');
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, colW, 256);
    }
    const rows = 6;
    const rowH = 256 / rows;
    for (let r = 0; r < rows; r += 1) {
        const y = r * rowH;
        ctx.fillStyle = `rgba(0,0,0,${(0.18 + rnd() * 0.06).toFixed(3)})`;
        ctx.fillRect(0, y + rowH - 4, 256, 4);
    }
    return finishCanvasTexture(canvas);
}

export function wallTexture(
    palette: ArchitecturalPalette,
    isAlt: boolean,
): THREE.Texture {
    if (palette.wallFinish === 'siding') return createSidingTexture(isAlt);
    // Wall UVs are (metres along, height / 0.25 m) for the fine siding courses; plaster must
    // repeat isotropically, once per metre.
    const tex = createRenderTexture();
    tex.repeat.set(1, 0.25);
    return tex;
}

export function roofTexture(palette: ArchitecturalPalette): THREE.Texture {
    // Roof UVs repeat every 0.45 m across the slope and 1 m up it (standing-seam module).
    if (palette.roofFinish === 'slate') {
        const tex = createSlateTexture();
        tex.repeat.set(0.45 / 1.2, 1);
        return tex;
    }
    if (palette.roofFinish === 'tile') {
        const tex = createClayTileTexture();
        tex.repeat.set(0.45 / 1.04, 1 / 1.4);
        return tex;
    }
    return createRoofStandingSeamTexture();
}
