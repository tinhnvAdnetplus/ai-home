import {
    useState,
    useCallback,
    type PointerEvent,
    type WheelEvent,
    type KeyboardEvent,
} from 'react';
import { type PanZoomState } from '../types/plan-view-types';

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 1.25;

export type PanZoomControls = {
    readonly state: PanZoomState;
    readonly isDragging: boolean;
    readonly transformString: string;
    readonly zoomIn: () => void;
    readonly zoomOut: () => void;
    readonly resetZoom: () => void;
    readonly handlePointerDown: (e: PointerEvent<SVGSVGElement>) => void;
    readonly handlePointerMove: (e: PointerEvent<SVGSVGElement>) => void;
    readonly handlePointerUp: () => void;
    readonly handleWheel: (e: WheelEvent<SVGSVGElement>) => void;
    readonly handleKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
    readonly svgProps: {
        readonly onPointerDown: (e: PointerEvent<SVGSVGElement>) => void;
        readonly onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
        readonly onPointerUp: () => void;
        readonly onPointerCancel: () => void;
        readonly onWheel: (e: WheelEvent<SVGSVGElement>) => void;
    };
};

export function usePanZoom(initialZoom = 1.0): PanZoomControls {
    const [state, setState] = useState<PanZoomState>({
        zoom: initialZoom,
        panX: 0,
        panY: 0,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const zoomIn = useCallback(() => {
        setState((prev) => ({
            ...prev,
            zoom: Math.min(MAX_ZOOM, prev.zoom * ZOOM_STEP),
        }));
    }, []);

    const zoomOut = useCallback(() => {
        setState((prev) => ({
            ...prev,
            zoom: Math.max(MIN_ZOOM, prev.zoom / ZOOM_STEP),
        }));
    }, []);

    const resetZoom = useCallback(() => {
        setState({ zoom: 1.0, panX: 0, panY: 0 });
    }, []);

    const handlePointerDown = useCallback((e: PointerEvent<SVGSVGElement>) => {
        if (e.pointerType === 'touch') {
            return;
        }
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback(
        (e: PointerEvent<SVGSVGElement>) => {
            if (!isDragging) return;
            const dx = (e.clientX - dragStart.x) * 10;
            const dy = (e.clientY - dragStart.y) * 10;
            setDragStart({ x: e.clientX, y: e.clientY });
            setState((prev) => ({
                ...prev,
                panX: prev.panX + dx,
                panY: prev.panY + dy,
            }));
        },
        [isDragging, dragStart],
    );

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleWheel = useCallback((e: WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
        setState((prev) => ({
            ...prev,
            zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor)),
        }));
    }, []);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            const step = 200;
            if (e.key === 'ArrowLeft') {
                setState((prev) => ({ ...prev, panX: prev.panX + step }));
            } else if (e.key === 'ArrowRight') {
                setState((prev) => ({ ...prev, panX: prev.panX - step }));
            } else if (e.key === 'ArrowUp') {
                setState((prev) => ({ ...prev, panY: prev.panY + step }));
            } else if (e.key === 'ArrowDown') {
                setState((prev) => ({ ...prev, panY: prev.panY - step }));
            } else if (e.key === '+' || e.key === '=') {
                zoomIn();
            } else if (e.key === '-' || e.key === '_') {
                zoomOut();
            } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
                resetZoom();
            }
        },
        [zoomIn, zoomOut, resetZoom],
    );

    const transformString = `translate(${state.panX.toString()}, ${state.panY.toString()}) scale(${state.zoom.toString()})`;

    return {
        state,
        isDragging,
        transformString,
        zoomIn,
        zoomOut,
        resetZoom,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleWheel,
        handleKeyDown,
        svgProps: {
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerCancel: handlePointerUp,
            onWheel: handleWheel,
        },
    };
}
