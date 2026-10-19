import { type Fixture, type Point } from '@aihome/bdm';
import { type PlanInput } from './types.js';

function resolveKitchenKind(kitchenType?: string): string {
    if (kitchenType === 'アイランド') return 'kitchen_island';
    if (kitchenType === '独立') return 'kitchen_l';
    return 'kitchen_counter';
}

export function generateLdkFixtures(
    pfx: string,
    b: { minX: number; maxX: number; minY: number; maxY: number },
    v: PlanInput,
    pt: (x: number, y: number) => Point,
): readonly Fixture[] {
    const fixtures: Fixture[] = [];
    const rmW = b.maxX - b.minX;
    const isIsland = v.kitchenType === 'アイランド';
    const kKind = resolveKitchenKind(v.kitchenType);
    const kW = isIsland ? 2400 : 2550;
    const kX = Math.max(
        b.minX + 200,
        Math.min(b.minX + (isIsland ? 800 : 300), b.maxX - kW - 200),
    );
    const kY = b.minY + 200;
    fixtures.push({
        id: `${pfx}-kitchen`,
        kind: kKind,
        pos: pt(kX, kY),
        rotation: 0,
    });

    const isBigFamily = (v.adults ?? 2) + (v.children ?? 2) > 4;
    const dtKind = isBigFamily ? 'dining_table_6' : 'dining_table_4';
    const dtW = isBigFamily ? 1800 : 1400;
    const dtX = Math.max(
        b.minX + 200,
        Math.min(b.minX + 500, b.maxX - dtW - 200),
    );
    const dtY = Math.min(b.minY + 1200, b.maxY - 1000);
    fixtures.push({
        id: `${pfx}-dining`,
        kind: dtKind,
        pos: pt(dtX, dtY),
        rotation: 0,
    });

    const sofaX = Math.max(
        b.minX + 200,
        Math.min(b.maxX - 2200, b.minX + rmW / 2),
    );
    const sofaY = Math.max(b.minY + 1600, b.maxY - 1100);
    fixtures.push({
        id: `${pfx}-sofa`,
        kind: 'sofa',
        pos: pt(sofaX, sofaY),
        rotation: 0,
    });

    const tvX = Math.max(b.minX + 200, Math.min(b.maxX - 1800, sofaX));
    const tvY = Math.max(b.minY + 400, Math.min(b.maxY - 600, sofaY - 1400));
    fixtures.push({
        id: `${pfx}-tv`,
        kind: 'tv_board',
        pos: pt(tvX, tvY),
        rotation: 0,
    });

    return fixtures;
}
