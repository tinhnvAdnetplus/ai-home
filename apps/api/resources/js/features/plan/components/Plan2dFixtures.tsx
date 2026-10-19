import { type Floor, type Fixture, type Point } from '@aihome/bdm';
import {
    FIXTURE_CATALOG,
    isFixtureKind,
    type FixtureKind,
} from '@aihome/planner';
import {
    Plan2dBed,
    Plan2dNightstand,
    Plan2dDesk,
    Plan2dWardrobe,
    Plan2dSofa,
    Plan2dSofaL,
    Plan2dDining,
    Plan2dLowTable,
    Plan2dTvBoard,
} from './Plan2dLivingSymbols';
import {
    Plan2dKitchen,
    Plan2dFridge,
    Plan2dBathtub,
    Plan2dVanity,
    Plan2dWasher,
    Plan2dToilet,
    Plan2dShoeBox,
    Plan2dStairs,
} from './Plan2dUtilitySymbols';

/** Each symbol is drawn at its natural (unrotated) size/position, then the whole thing is
 * rotated in place — so the symbol components themselves never need to know about rotation. */
function renderByKind(
    kind: FixtureKind,
    pos: Point,
    widthMm: number,
    heightMm: number,
): React.JSX.Element | null {
    switch (kind) {
        case 'kitchen_counter':
        case 'kitchen_island':
        case 'kitchen_l':
            return <Plan2dKitchen pos={pos} width={widthMm} depth={heightMm} />;
        case 'fridge':
            return <Plan2dFridge pos={pos} size={widthMm} />;
        case 'dining_table_4':
        case 'dining_table_6':
            return (
                <Plan2dDining
                    pos={{ x: pos.x + widthMm / 2, y: pos.y + heightMm / 2 }}
                    radius={widthMm / 2}
                />
            );
        case 'sofa':
            return <Plan2dSofa pos={pos} width={widthMm} height={heightMm} />;
        case 'sofa_l':
            return <Plan2dSofaL pos={pos} width={widthMm} height={heightMm} />;
        case 'low_table':
            return <Plan2dLowTable pos={pos} width={widthMm} height={heightMm} />;
        case 'tv_board':
            return <Plan2dTvBoard pos={pos} width={widthMm} height={heightMm} />;
        case 'bathtub':
            return <Plan2dBathtub pos={pos} width={widthMm} height={heightMm} />;
        case 'vanity':
            return <Plan2dVanity pos={pos} width={widthMm} depth={heightMm} />;
        case 'washing_machine':
            return <Plan2dWasher pos={pos} size={widthMm} />;
        case 'toilet_bowl':
            return <Plan2dToilet pos={pos} width={widthMm} height={heightMm} />;
        case 'bed_double':
            return (
                <Plan2dBed
                    pos={pos}
                    width={widthMm}
                    height={heightMm}
                    isTwin={false}
                />
            );
        case 'bed_single':
            return (
                <Plan2dBed
                    pos={pos}
                    width={widthMm}
                    height={heightMm}
                    isTwin={true}
                />
            );
        case 'nightstand':
            return <Plan2dNightstand pos={pos} size={widthMm} />;
        case 'desk':
            return <Plan2dDesk pos={pos} width={widthMm} height={heightMm} />;
        case 'wardrobe':
            return <Plan2dWardrobe pos={pos} width={widthMm} height={heightMm} />;
        case 'shoe_box':
            return <Plan2dShoeBox pos={pos} width={widthMm} depth={heightMm} />;
    }
}

function renderOneFixture(f: Fixture): React.JSX.Element | null {
    if (!isFixtureKind(f.kind)) return null; // unknown/legacy kind: skip rather than crash
    const { widthMm, heightMm } = FIXTURE_CATALOG[f.kind];
    const isSwapped = f.rotation === 90 || f.rotation === 270;
    const footprintW = isSwapped ? heightMm : widthMm;
    const footprintH = isSwapped ? widthMm : heightMm;
    const centerX = f.pos.x + footprintW / 2;
    const centerY = f.pos.y + footprintH / 2;
    const naturalPos: Point = {
        x: centerX - widthMm / 2,
        y: centerY - heightMm / 2,
    };
    const inner = renderByKind(f.kind, naturalPos, widthMm, heightMm);
    if (!inner) return null;
    return (
        <g
            key={f.id}
            transform={`rotate(${f.rotation.toString()} ${centerX.toString()} ${centerY.toString()})`}
        >
            {inner}
        </g>
    );
}

/** Draws every fixture the planner placed (AI-authored or rule-based — both populate the same
 * `floor.fixtures` array), plus the stairs' tread symbol, which is structural, not furniture, so
 * it is always drawn from the room geometry itself rather than being a fixture entry. */
export function Plan2dFixtures({
    floor,
    upLabel,
}: {
    readonly floor: Floor;
    readonly upLabel: string;
}): React.JSX.Element {
    return (
        <g className="plan2d-fixtures">
            {floor.rooms.map((room) => {
                if (room.type !== 'stairs') return null;
                const xs = room.polygon.map((p) => p.x);
                const ys = room.polygon.map((p) => p.y);
                const x = Math.min(...xs);
                const y = Math.min(...ys);
                const w = Math.max(...xs) - x;
                const h = Math.max(...ys) - y;
                if (w < 800 || h < 1200) return null;
                return (
                    <Plan2dStairs
                        key={`stairs-${room.id}`}
                        pos={{ x, y }}
                        width={w}
                        height={h}
                        upLabel={upLabel}
                    />
                );
            })}
            {floor.fixtures.map(renderOneFixture)}
        </g>
    );
}
