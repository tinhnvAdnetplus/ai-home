import { useMemo } from 'react';
import { type BuildingModel } from '@aihome/bdm';
import {
    computeFloorBuildingViewBox,
    pointsToSvgString,
    formatViewBox,
} from '../lib/svg-geometry';
import { getRoomStyle } from '../lib/room-styles';

type PlanMiniThumbProps = {
    readonly model: BuildingModel;
    readonly className?: string | undefined;
};

export function PlanMiniThumb({
    model,
    className = 'h-20 w-20 sm:h-24 sm:w-24',
}: PlanMiniThumbProps): React.JSX.Element {
    const floor = model.floors[0];

    const viewBoxBounds = useMemo(() => {
        if (!floor) {
            return { minX: 0, minY: 0, width: 10000, height: 10000 };
        }
        return computeFloorBuildingViewBox(floor, {
            top: 600,
            bottom: 600,
            left: 600,
            right: 600,
        });
    }, [floor]);

    if (!floor) {
        return (
            <div
                className={`rounded-xl bg-slate-100 ${className}`}
                aria-hidden="true"
            />
        );
    }

    return (
        <div
            className={`relative flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/70 p-1 overflow-hidden shrink-0 ${className}`}
        >
            <svg
                viewBox={formatViewBox(viewBoxBounds)}
                className="h-full w-full object-contain pointer-events-none"
                aria-hidden="true"
            >
                {floor.rooms.map((room) => {
                    const style = getRoomStyle(room.type, true);
                    return (
                        <polygon
                            key={room.id}
                            points={pointsToSvgString(room.polygon)}
                            fill={style.fill}
                            stroke="none"
                        />
                    );
                })}
                {floor.walls.map((wall) => (
                    <line
                        key={wall.id}
                        x1={wall.a.x}
                        y1={wall.a.y}
                        x2={wall.b.x}
                        y2={wall.b.y}
                        stroke="#64748b"
                        strokeWidth={140}
                        strokeLinecap="square"
                    />
                ))}
            </svg>
        </div>
    );
}
