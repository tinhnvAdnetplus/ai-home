import { type Plan2dOptions } from '../lib/plan2d-types';
import { FloorLevelSelector } from './FloorLevelSelector';
import { FloorLayerButtons } from './FloorLayerButtons';
import { FloorZoomButtons } from './FloorZoomButtons';

type FloorControlsProps = {
    readonly activeLevel: number;
    readonly maxLevel: number;
    readonly onSelectLevel: (level: number) => void;
    readonly options: Plan2dOptions;
    readonly onToggleOption?: ((key: keyof Plan2dOptions) => void) | undefined;
    readonly onToggleGrid?: (() => void) | undefined;
    readonly onToggleFixtures?: (() => void) | undefined;
    readonly onToggleDimensions?: (() => void) | undefined;
    readonly onToggleColor?: (() => void) | undefined;
    readonly onZoomIn?: (() => void) | undefined;
    readonly onZoomOut?: (() => void) | undefined;
    readonly onResetZoom?: (() => void) | undefined;
    readonly zoomControls?:
        | {
              readonly zoomIn: () => void;
              readonly zoomOut: () => void;
              readonly resetZoom: () => void;
          }
        | undefined;
    readonly isFullscreen?: boolean | undefined;
    readonly onToggleFullscreen?: (() => void) | undefined;
};

export function FloorControls({
    activeLevel,
    maxLevel,
    onSelectLevel,
    options,
    onToggleOption,
    onToggleGrid,
    onToggleFixtures,
    onToggleDimensions,
    onToggleColor,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    zoomControls,
    isFullscreen,
    onToggleFullscreen,
}: FloorControlsProps): React.JSX.Element {
    return (
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 bg-slate-50/80 px-2.5 sm:px-3.5 py-2 min-w-0 w-full overflow-hidden">
            <div className="flex items-center gap-1 shrink-0">
                <FloorLevelSelector
                    activeLevel={activeLevel}
                    maxLevel={maxLevel}
                    onSelectLevel={onSelectLevel}
                />
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <FloorLayerButtons
                    options={options}
                    onToggleGrid={
                        onToggleGrid ??
                        (() => onToggleOption?.('isGridVisible'))
                    }
                    onToggleFixtures={
                        onToggleFixtures ??
                        (() => onToggleOption?.('isFixturesVisible'))
                    }
                    onToggleDimensions={
                        onToggleDimensions ??
                        (() => onToggleOption?.('isDimensionsVisible'))
                    }
                    onToggleColor={
                        onToggleColor ?? (() => onToggleOption?.('isColorMode'))
                    }
                />

                <div className="h-4 w-px bg-slate-200 mx-0.5" />

                <FloorZoomButtons
                    onZoomIn={onZoomIn ?? zoomControls?.zoomIn}
                    onZoomOut={onZoomOut ?? zoomControls?.zoomOut}
                    onResetZoom={onResetZoom ?? zoomControls?.resetZoom}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={onToggleFullscreen}
                />
            </div>
        </div>
    );
}
