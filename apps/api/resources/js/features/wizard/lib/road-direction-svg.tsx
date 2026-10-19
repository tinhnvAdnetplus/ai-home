export type RoadDirection = 'north' | 'south' | 'east' | 'west';

export function isRoadDirection(key: string | undefined): key is RoadDirection {
    if (!key) return false;
    return (
        key === 'north' ||
        key === 'south' ||
        key === 'east' ||
        key === 'west' ||
        key.startsWith('tile-road-')
    );
}

export function normalizeRoadDirection(key: string): RoadDirection {
    if (key.includes('north')) return 'north';
    if (key.includes('south')) return 'south';
    if (key.includes('east')) return 'east';
    return 'west';
}

type DirectionConfig = {
    readonly letter: string;
    readonly arrow: string;
    readonly plotPoints: string;
    readonly house: { x: number; y: number; w: number; h: number };
    readonly road: { x: number; y: number; w: number; h: number };
    readonly line: { x1: number; y1: number; x2: number; y2: number };
};

const CONFIG: Readonly<Record<RoadDirection, DirectionConfig>> = {
    north: {
        letter: 'N',
        arrow: '45,1.5 42,5 48,5',
        plotPoints: '24,28 66,28 70,58 20,58',
        house: { x: 37, y: 38, w: 16, h: 12 },
        road: { x: 18, y: 20, w: 54, h: 8 },
        line: { x1: 18, y1: 24, x2: 72, y2: 24 },
    },
    south: {
        letter: 'S',
        arrow: '45,18.5 42,15 48,15',
        plotPoints: '24,24 66,24 70,54 20,54',
        house: { x: 37, y: 34, w: 16, h: 12 },
        road: { x: 16, y: 54, w: 58, h: 9 },
        line: { x1: 18, y1: 58.5, x2: 72, y2: 58.5 },
    },
    east: {
        letter: 'E',
        arrow: '53.5,10 50,7.5 50,12.5',
        plotPoints: '20,24 58,24 58,62 20,62',
        house: { x: 29, y: 36, w: 16, h: 14 },
        road: { x: 58, y: 24, w: 12, h: 38 },
        line: { x1: 64, y1: 24, x2: 64, y2: 62 },
    },
    west: {
        letter: 'W',
        arrow: '36.5,10 40,7.5 40,12.5',
        plotPoints: '32,24 70,24 70,62 32,62',
        house: { x: 45, y: 36, w: 16, h: 14 },
        road: { x: 20, y: 24, w: 12, h: 38 },
        line: { x1: 26, y1: 24, x2: 26, y2: 62 },
    },
};

type Props = {
    readonly direction: RoadDirection;
    readonly className?: string | undefined;
};

export function RoadDirectionSvg({
    direction,
    className = 'w-full h-full max-h-[55px]',
}: Props): React.JSX.Element {
    const cfg = CONFIG[direction];

    return (
        <svg
            viewBox="0 0 90 70"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            {/* Compass */}
            <circle
                cx="45"
                cy="10"
                r="6"
                fill="#ffffff"
                stroke="#475569"
                strokeWidth="1"
            />
            <text
                x="45"
                y="12.5"
                textAnchor="middle"
                fontSize="6.5"
                fontWeight="bold"
                fill="#1e293b"
            >
                {cfg.letter}
            </text>
            <polygon points={cfg.arrow} fill="#475569" />

            {/* Green Plot */}
            <polygon
                points={cfg.plotPoints}
                fill="#b8dc9a"
                stroke="#7eb86b"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />

            {/* White House Footprint */}
            <rect
                x={cfg.house.x}
                y={cfg.house.y}
                width={cfg.house.w}
                height={cfg.house.h}
                rx="1.5"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.8"
            />

            {/* Gray Road */}
            <rect
                x={cfg.road.x}
                y={cfg.road.y}
                width={cfg.road.w}
                height={cfg.road.h}
                fill="#94a3b8"
                rx="1"
            />
            <line
                x1={cfg.line.x1}
                y1={cfg.line.y1}
                x2={cfg.line.x2}
                y2={cfg.line.y2}
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeDasharray="2.5 2"
            />
        </svg>
    );
}
