import {
    useState, useMemo, useRef, forwardRef, useImperativeHandle,
} from 'react';
import { useTranslation } from 'react-i18next';
import { type BuildingModel } from '@aihome/bdm';
import {
    computeFloorBuildingViewBox,
    formatViewBox,
    DEFAULT_VIEWPORT_BOUNDS,
    FLOOR_VIEWBOX_PADDING,
} from '../lib/svg-geometry';
import { collectExteriorPoints } from '../lib/plan2d-geometry';
import { mirrorModelY } from '../lib/mirror-model';
import { usePanZoom } from '../hooks/usePanZoom';
import {
    type Plan2dOptions,
    type FloorPlanViewHandle,
    DEFAULT_PLAN2D_OPTIONS,
} from '../lib/plan2d-types';
import { useFullscreenToggle } from '../hooks/useFullscreenToggle';
import { FloorControls } from './FloorControls';
import { SvgBuildingFloor } from './SvgBuildingFloor';

export type { FloorPlanViewHandle };

type FloorPlanViewProps = {
    readonly model: BuildingModel;
    readonly planLabel?: string | undefined;
};

export const FloorPlanView = forwardRef<FloorPlanViewHandle, FloorPlanViewProps>(
    function FloorPlanView({ model: rawModel, planLabel }, ref): React.JSX.Element {
        const { t } = useTranslation(['plan', 'common']);
        const model = useMemo(() => mirrorModelY(rawModel), [rawModel]);
        const svgRef = useRef<SVGSVGElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const [isFullscreen, setIsFullscreen] = useState(false);
        const handleToggleFullscreen = useFullscreenToggle(containerRef, setIsFullscreen);
        const [activeLevel, setActiveLevel] = useState<number>(() => {
            const m = /[?&]floor=(\d)/.exec(window.location.hash);
            return import.meta.env.DEV && m?.[1] ? Number(m[1]) : 1;
        });
        const [options, setOptions] = useState(DEFAULT_PLAN2D_OPTIONS);

        useImperativeHandle(ref, () => ({ getSvgElement: () => svgRef.current }));

        const maxLevel = useMemo(
            () => model.floors.reduce((max, f) => Math.max(max, f.level), 1),
            [model.floors],
        );
        const effectiveLevel = activeLevel > maxLevel ? 1 : activeLevel;
        const currentFloor = useMemo(
            () => model.floors.find((f) => f.level === effectiveLevel) ?? model.floors[0],
            [model.floors, effectiveLevel],
        );

        const viewBoxBounds = useMemo(() => {
            if (!currentFloor) return DEFAULT_VIEWPORT_BOUNDS;
            const extraPoints =
                currentFloor.level === 1
                    ? collectExteriorPoints(model.site, model.parking, model.exterior)
                    : [];
            return computeFloorBuildingViewBox(currentFloor, FLOOR_VIEWBOX_PADDING, extraPoints);
        }, [currentFloor, model.site, model.parking, model.exterior]);

        const panZoom = usePanZoom(1.0, svgRef);
        const handleSelectLevel = (level: number): void => {
            setActiveLevel(level);
            panZoom.resetZoom();
        };
        const toggleOption = (key: keyof Plan2dOptions): void => {
            setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
        };

    return (
        <div
            ref={containerRef}
            className={`flex flex-col border border-slate-200/80 bg-white shadow-xs overflow-hidden w-full min-w-0 ${
                isFullscreen
                    ? 'h-screen w-screen rounded-none border-0'
                    : 'rounded-[24px]'
            }`}
        >
            <FloorControls
                activeLevel={effectiveLevel}
                maxLevel={maxLevel}
                onSelectLevel={handleSelectLevel}
                options={options}
                onToggleOption={toggleOption}
                zoomControls={panZoom}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
            />

            <div
                className={`relative w-full bg-white cursor-grab active:cursor-grabbing select-none overflow-hidden ${
                    isFullscreen
                        ? 'flex-1 min-h-0'
                        : 'h-[50vh] min-h-[360px] sm:h-[560px] sm:min-h-[520px] lg:h-[640px]'
                }`}
            >
                <svg
                    ref={svgRef}
                    viewBox={formatViewBox(viewBoxBounds)}
                    className="h-full w-full touch-pan-y"
                    {...panZoom.svgProps}
                >
                    <g transform={panZoom.transformString}>
                        {currentFloor ? (
                            <SvgBuildingFloor
                                floor={currentFloor}
                                site={model.site}
                                parking={model.parking}
                                exterior={model.exterior}
                                options={options}
                                planLabel={planLabel}
                            />
                        ) : null}
                    </g>
                </svg>

                <div className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] text-slate-500 backdrop-blur-xs border border-slate-200/60 shadow-2xs">
                    {t('plan:panHint')}
                </div>
            </div>
        </div>
    );
});

FloorPlanView.displayName = 'FloorPlanView';
