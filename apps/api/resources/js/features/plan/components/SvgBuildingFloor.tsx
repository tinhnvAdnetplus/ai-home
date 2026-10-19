import { type Floor, type Site, type Parking, type Exterior } from '@aihome/bdm';
import { type Plan2dOptions } from '../lib/plan2d-types';
import { getRoomStyle } from '../lib/room-styles';
import { pointsToSvgString } from '../lib/svg-geometry';
import { computeFloorBounds } from '../lib/plan2d-geometry';
import { Plan2dHatches } from './Plan2dHatches';
import { Plan2dFixturesLayer } from './Plan2dFixturesLayer';
import { Plan2dWallsLayer } from './Plan2dWallsLayer';
import { Plan2dLabelsLayer } from './Plan2dLabelsLayer';
import { Plan2dDimensionsLayer } from './Plan2dDimensionsLayer';
import { Plan2dExteriorLayer } from './Plan2dExteriorLayer';

type SvgBuildingFloorProps = {
    readonly floor: Floor;
    readonly site?: Site | undefined;
    readonly parking?: Parking | undefined;
    readonly exterior?: Exterior | undefined;
    readonly options: Plan2dOptions;
    readonly planLabel?: string | undefined;
};

export function SvgBuildingFloor({
    floor,
    site,
    parking,
    exterior,
    options,
    planLabel,
}: SvgBuildingFloorProps): React.JSX.Element {
    const bounds = computeFloorBounds(floor);
    const footprintD = floor.rooms
        .map((r) => {
            const pts = r.polygon;
            if (pts.length === 0) return '';
            const first = pts[0];
            if (!first) return '';
            const rest = pts
                .slice(1)
                .map((p) => `L ${p.x.toString()} ${p.y.toString()}`)
                .join(' ');
            return `M ${first.x.toString()} ${first.y.toString()} ${rest} Z`;
        })
        .join(' ');

    return (
        <g className="building-floor">
            <defs>
                <pattern
                    id="sheet-grid-pattern"
                    width="455"
                    height="455"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M 455 0 H 0 V 455"
                        fill="none"
                        stroke="#eef1ee"
                        strokeWidth="10"
                    />
                </pattern>
                <filter
                    id="building-base-shadow"
                    x="-8%"
                    y="-8%"
                    width="120%"
                    height="120%"
                >
                    <feDropShadow
                        dx="0"
                        dy="26"
                        stdDeviation="60"
                        floodColor="#8a938c"
                        floodOpacity="0.2"
                    />
                </filter>
            </defs>

            {/* Grid sheet */}
            {options.isGridVisible ? (
                <rect
                    x={bounds.minX - 3000}
                    y={bounds.minY - 3000}
                    width={bounds.width + 6000}
                    height={bounds.height + 6000}
                    fill="url(#sheet-grid-pattern)"
                />
            ) : null}

            {/* Exterior site, parking, wood deck, approach, and garden trees */}
            {site ? (
                <Plan2dExteriorLayer
                    site={site}
                    parking={floor.level === 1 ? parking : undefined}
                    exterior={floor.level === 1 ? exterior : undefined}
                />
            ) : null}

            {/* Building base footprint shadow */}
            {footprintD ? (
                <path
                    d={footprintD}
                    fill="#ffffff"
                    filter="url(#building-base-shadow)"
                />
            ) : null}

            {/* Room background fills */}
            {floor.rooms.map((room) => {
                const style = getRoomStyle(room.type, options.isColorMode);
                const pts = pointsToSvgString(room.polygon);
                return (
                    <polygon
                        key={`room-poly-${room.id}`}
                        points={pts}
                        fill={style.fill}
                        stroke="none"
                    />
                );
            })}

            {/* Floor finishes (wood plank hatch, tatami, tile/doma) */}
            <Plan2dHatches rooms={floor.rooms} />

            {/* Architectural furniture and fixtures */}
            {options.isFixturesVisible ? (
                <Plan2dFixturesLayer floor={floor} />
            ) : null}

            {/* Solid grey walls and architectural openings */}
            <Plan2dWallsLayer floor={floor} />

            {/* Room labels with auto-shrink font, halo, and collision prevention */}
            <Plan2dLabelsLayer
                rooms={floor.rooms}
                fixtures={options.isFixturesVisible ? floor.fixtures : []}
            />

            {/* Dimension chains, module ticks, north arrow, and title block */}
            {options.isDimensionsVisible && site ? (
                <Plan2dDimensionsLayer
                    floor={floor}
                    site={site}
                    parking={floor.level === 1 ? parking : undefined}
                    exterior={floor.level === 1 ? exterior : undefined}
                    planLabel={planLabel}
                />
            ) : null}
        </g>
    );
}
