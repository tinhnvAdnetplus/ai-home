import { type Floor, type Wall } from '@aihome/bdm';
import {
    WALL_EXT_COLOR,
    WALL_INT_COLOR,
    WALL_EXT_THICKNESS,
    WALL_INT_THICKNESS,
} from '../lib/plan2d-colors';
import { Plan2dOpeningSymbol } from './Plan2dOpeningSymbol';

type Plan2dWallsLayerProps = {
    readonly floor: Floor;
};

export function Plan2dWallsLayer({
    floor,
}: Plan2dWallsLayerProps): React.JSX.Element {
    const wallMap = new Map<string, Wall>();
    for (const w of floor.walls) {
        wallMap.set(w.id, w);
    }

    return (
        <g className="plan2d-walls-and-openings">
            {floor.walls.map((wall) => {
                const isExt = wall.kind === 'exterior';
                return (
                    <line
                        key={`wall-${wall.id}`}
                        x1={wall.a.x}
                        y1={wall.a.y}
                        x2={wall.b.x}
                        y2={wall.b.y}
                        stroke={isExt ? WALL_EXT_COLOR : WALL_INT_COLOR}
                        strokeWidth={
                            isExt ? WALL_EXT_THICKNESS : WALL_INT_THICKNESS
                        }
                        strokeLinecap="square"
                    />
                );
            })}

            {floor.openings.map((op) => {
                const wall = wallMap.get(op.wallId);
                return wall ? (
                    <Plan2dOpeningSymbol
                        key={`opening-${op.id}`}
                        op={op}
                        wall={wall}
                    />
                ) : null;
            })}
        </g>
    );
}
