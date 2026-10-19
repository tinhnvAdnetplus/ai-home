import { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isWebGlSupported } from '../lib/webgl-detect.js';
import {
    type CameraPreset,
    type LightPreset,
    type Plan3DViewerProps,
} from '../types.js';
import { Plan3DCanvas, type Plan3DCanvasHandle } from './Plan3DCanvas.js';
import { ViewerControls } from './ViewerControls.js';
import { useFullscreenToggle } from '../hooks/useFullscreenToggle.js';
import { WalkOverlay } from './WalkOverlay.js';
import { WebGlFallback } from './WebGlFallback.js';

export function Plan3DViewer({
    model,
    materials,
    fallback2DPlan,
    className,
    initialCutawayLevel,
    initialCameraPreset,
    initialLightPreset,
}: Plan3DViewerProps): React.JSX.Element {
    const { t } = useTranslation();
    const isSupported = useMemo(() => isWebGlSupported(), []);
    const [cutawayLevel, setCutawayLevel] = useState<number | null>(
        initialCutawayLevel ?? null,
    );
    const [isShowRoomNames, setIsShowRoomNames] = useState(false);
    const [cameraPreset, setCameraPreset] = useState<CameraPreset>(
        initialCameraPreset ?? 'exterior',
    );
    const [lightPreset, setLightPreset] = useState<LightPreset>(
        initialLightPreset ?? 'day',
    );
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [walkLevel, setWalkLevel] = useState(initialCutawayLevel ?? 1);
    const [stairTarget, setStairTarget] = useState<number | null>(null);

    const canvasHandleRef = useRef<Plan3DCanvasHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalFloors = model.floors.length;

    const handleSaveImage = useCallback(() => {
        canvasHandleRef.current?.saveImage();
    }, []);

    const handleSelectCamera = useCallback((preset: CameraPreset) => {
        setCameraPreset(preset);
        if (preset === 'birdeye') {
            setCutawayLevel((prev) => prev ?? 1);
        } else {
            setCutawayLevel(null);
        }
    }, []);

    const handleSelectCutaway = useCallback(
        (level: number | null) => {
            if (cameraPreset === 'walk') {
                if (level !== null) setWalkLevel(level);
                return;
            }
            setCutawayLevel(level);
            if (level !== null && cameraPreset === 'exterior') {
                setCameraPreset('birdeye');
            } else if (level === null && cameraPreset === 'birdeye') {
                setCameraPreset('exterior');
            }
        },
        [cameraPreset],
    );

    const handleToggleRoomNames = useCallback(() => {
        setIsShowRoomNames((isPrev) => !isPrev);
    }, []);

    const handleToggleFullscreen = useFullscreenToggle(
        containerRef,
        setIsFullscreen,
    );

    if (!isSupported) {
        return (
            <WebGlFallback
                fallback2DPlan={fallback2DPlan}
                className={className}
            />
        );
    }

    return (
        <section
            ref={containerRef}
            aria-label={t('plan3d:title')}
            className={`relative w-full min-h-[380px] h-[60vh] sm:min-h-[520px] sm:h-[580px] lg:h-[640px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-50 ${className ?? ''}`}
        >
            <ViewerControls
                totalFloors={totalFloors}
                cutawayLevel={
                    cameraPreset === 'walk' ? walkLevel : cutawayLevel
                }
                isShowRoomNames={isShowRoomNames}
                cameraPreset={cameraPreset}
                lightPreset={lightPreset}
                isFullscreen={isFullscreen}
                onSelectCutaway={handleSelectCutaway}
                onToggleRoomNames={handleToggleRoomNames}
                onSelectCamera={handleSelectCamera}
                onSelectLight={setLightPreset}
                onSaveImage={handleSaveImage}
                onToggleFullscreen={handleToggleFullscreen}
            />

            <Plan3DCanvas
                ref={canvasHandleRef}
                model={model}
                materials={materials}
                cutawayLevel={cutawayLevel}
                isShowRoomNames={isShowRoomNames}
                cameraPreset={cameraPreset}
                walkLevel={walkLevel}
                onStairHint={setStairTarget}
                lightPreset={lightPreset}
            />

            {cameraPreset === 'walk' && (
                <WalkOverlay
                    stairTarget={stairTarget}
                    currentLevel={walkLevel}
                    onInput={(input, isOn) => {
                        canvasHandleRef.current?.walkInput(input, isOn);
                    }}
                    onChangeLevel={setWalkLevel}
                />
            )}

            <footer className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-10">
                <span className="inline-block px-3 py-1 text-xs sm:text-[11px] font-medium text-slate-500 bg-white/80 backdrop-blur-xs rounded-full border border-slate-200/60 shadow-xs">
                    {cameraPreset === 'walk'
                        ? t('plan3d:walk.hint')
                        : t('plan3d:controlsHint')}
                </span>
            </footer>
        </section>
    );
}
