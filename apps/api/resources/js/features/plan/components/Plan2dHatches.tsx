import { type Room } from '@aihome/bdm';
import { pointsToSvgString } from '../lib/svg-geometry';
import { computePointsBounds } from '../lib/plan2d-geometry';
import { ROOM_FINISH_MAP, GRID_MM } from '../lib/plan2d-colors';

type Plan2dHatchesProps = {
    readonly rooms: readonly Room[];
};

function renderWoodFinish(room: Room): React.JSX.Element {
    const b = computePointsBounds(room.polygon);
    const pitch = GRID_MM / 6;
    const lines: React.JSX.Element[] = [];

    for (let y = b.minY + pitch; y < b.maxY; y += pitch) {
        lines.push(
            <line
                key={`wood-${room.id}-${y.toString()}`}
                x1={b.minX}
                y1={y}
                x2={b.maxX}
                y2={y}
                stroke="#dfe3df"
                strokeWidth={10}
            />,
        );
    }

    return (
        <g key={`finish-${room.id}`} clipPath={`url(#finish-clip-${room.id})`}>
            {lines}
        </g>
    );
}

function renderTatamiFinish(room: Room): React.JSX.Element {
    const b = computePointsBounds(room.polygon);
    const matW = GRID_MM;
    const matH = GRID_MM * 2;
    const mats: React.JSX.Element[] = [];

    for (let x = b.minX; x + matW <= b.maxX + 10; x += matW) {
        for (let y = b.minY; y + matH <= b.maxY + 10; y += matH) {
            mats.push(
                <g key={`tatami-${room.id}-${x.toString()}-${y.toString()}`}>
                    <rect
                        x={x + 20}
                        y={y + 20}
                        width={matW - 40}
                        height={matH - 40}
                        fill="none"
                        stroke="#cbbf98"
                        strokeWidth={26}
                    />
                    <rect
                        x={x + 90}
                        y={y + 90}
                        width={matW - 180}
                        height={matH - 180}
                        fill="none"
                        stroke="#e0d7ba"
                        strokeWidth={12}
                    />
                </g>,
            );
        }
    }

    return (
        <g key={`finish-${room.id}`} clipPath={`url(#finish-clip-${room.id})`}>
            {mats}
        </g>
    );
}

function renderDomaFinish(room: Room): React.JSX.Element {
    const b = computePointsBounds(room.polygon);
    const step = 455;
    const lines: React.JSX.Element[] = [];

    for (let x = b.minX + step; x < b.maxX; x += step) {
        lines.push(
            <line
                key={`doma-v-${room.id}-${x.toString()}`}
                x1={x}
                y1={b.minY}
                x2={x}
                y2={b.maxY}
                stroke="#e0e0dc"
                strokeWidth={11}
            />,
        );
    }
    for (let y = b.minY + step; y < b.maxY; y += step) {
        lines.push(
            <line
                key={`doma-h-${room.id}-${y.toString()}`}
                x1={b.minX}
                y1={y}
                x2={b.maxX}
                y2={y}
                stroke="#e0e0dc"
                strokeWidth={11}
            />,
        );
    }

    return (
        <g key={`finish-${room.id}`} clipPath={`url(#finish-clip-${room.id})`}>
            {lines}
        </g>
    );
}

export function Plan2dHatches({
    rooms,
}: Plan2dHatchesProps): React.JSX.Element {
    return (
        <g className="plan2d-floor-finishes">
            <defs>
                {rooms.map((room) => (
                    <clipPath
                        key={`clip-def-${room.id}`}
                        id={`finish-clip-${room.id}`}
                    >
                        <polygon points={pointsToSvgString(room.polygon)} />
                    </clipPath>
                ))}
            </defs>

            {rooms.map((room) => {
                const finish = ROOM_FINISH_MAP[room.type];
                if (finish === 'wood') return renderWoodFinish(room);
                if (finish === 'tatami') return renderTatamiFinish(room);
                if (finish === 'doma') return renderDomaFinish(room);
                return null;
            })}
        </g>
    );
}
