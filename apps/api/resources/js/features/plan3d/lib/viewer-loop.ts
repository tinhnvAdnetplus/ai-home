import * as THREE from 'three';
import { type WalkController } from './walk-controller.js';

type LoopOptions = {
    readonly container: HTMLDivElement;
    readonly canvas: HTMLCanvasElement;
    readonly renderer: THREE.WebGLRenderer;
    readonly scene: THREE.Scene;
    readonly camera: THREE.PerspectiveCamera;
    readonly getWalk: () => WalkController | null;
    readonly onFrame: () => void;
    readonly onTick: () => void;
    readonly onResize: () => void;
};

/** Render loop + visibility/resize/context-loss handling; returns a disposer. */
export function startViewerLoop(o: LoopOptions): () => void {
    let isVis = true;
    let animId = 0;
    let lastMs = performance.now();
    const tick = (): void => {
        const nowMs = performance.now();
        if (isVis && !document.hidden) {
            const walk = o.getWalk();
            if (walk) walk.update((nowMs - lastMs) / 1000);
            else o.onTick();
            o.onFrame();
            o.renderer.render(o.scene, o.camera);
        }
        lastMs = nowMs;
        animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => {
        isVis = Boolean(e?.isIntersecting);
    });
    io.observe(o.container);
    const ro = new ResizeObserver(([e]) => {
        if (!e || e.contentRect.width <= 0 || e.contentRect.height <= 0) return;
        o.camera.aspect = e.contentRect.width / e.contentRect.height;
        o.camera.updateProjectionMatrix();
        o.renderer.setSize(e.contentRect.width, e.contentRect.height);
        o.onResize();
    });
    ro.observe(o.container);

    const onLost = (e: Event): void => {
        e.preventDefault();
        cancelAnimationFrame(animId);
    };
    const onRestored = (): void => {
        animId = requestAnimationFrame(tick);
    };
    o.canvas.addEventListener('webglcontextlost', onLost);
    o.canvas.addEventListener('webglcontextrestored', onRestored);
    return () => {
        cancelAnimationFrame(animId);
        io.disconnect();
        ro.disconnect();
        o.canvas.removeEventListener('webglcontextlost', onLost);
        o.canvas.removeEventListener('webglcontextrestored', onRestored);
    };
}
