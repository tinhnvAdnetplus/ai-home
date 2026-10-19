import { type Opening, type Wall } from '@aihome/bdm';
import { computeOpeningRenderData } from '../lib/svg-elements';
import { Plan2dWindowOpening } from './Plan2dWindowOpening';
import { Plan2dDoorOpening } from './Plan2dDoorOpening';

type Plan2dOpeningSymbolProps = {
    readonly op: Opening;
    readonly wall: Wall;
};

export function Plan2dOpeningSymbol({
    op,
    wall,
}: Plan2dOpeningSymbolProps): React.JSX.Element | null {
    const data = computeOpeningRenderData(op, wall);
    if (!data) return null;

    const dx = wall.b.x - wall.a.x;
    const dy = wall.b.y - wall.a.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return null;
    const nx = -dy / len;
    const ny = dx / len;

    if (data.kind === 'window' || data.kind === 'largeWindow') {
        return (
            <Plan2dWindowOpening
                opId={op.id}
                wall={wall}
                data={data}
                nx={nx}
                ny={ny}
            />
        );
    }

    return (
        <Plan2dDoorOpening
            opId={op.id}
            wall={wall}
            data={data}
            nx={nx}
            ny={ny}
        />
    );
}
