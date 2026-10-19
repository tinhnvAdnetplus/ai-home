import { type RefObject, useEffect, useRef } from 'react';

const DESIGN_HEIGHT = 1070;
const DESKTOP_MIN_WIDTH = 1024;
const MIN_SCALE = 0.55;

function applyFit(el: HTMLElement): void {
    if (window.innerWidth < DESKTOP_MIN_WIDTH) {
        el.style.removeProperty('zoom');
        el.style.removeProperty('height');
        return;
    }
    const scale = Math.max(
        MIN_SCALE,
        Math.min(1, window.innerHeight / DESIGN_HEIGHT),
    );
    el.style.setProperty('zoom', String(scale));
    el.style.setProperty('height', `${String(window.innerHeight / scale)}px`);
}

/** Scales the desktop wizard so the whole design always fits the window height. */
export function useFitViewport<T extends HTMLElement>(): RefObject<T> {
    const ref = useRef<T>(null);
    useEffect(() => {
        const update = (): void => {
            if (ref.current) applyFit(ref.current);
        };
        update();
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('resize', update);
        };
    }, []);
    return ref;
}
