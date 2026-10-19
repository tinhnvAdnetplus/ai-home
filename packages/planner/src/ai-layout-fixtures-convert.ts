import { type Fixture } from '@aihome/bdm';
import { type AiLayoutFixture } from './ai-layout-schema.js';

/** Grid units (same axes as `rects`) to the BDM `Fixture` shape (mm). The AI picks kind +
 * position + rotation; the item's physical size comes from the fixed catalog, not from here. */
export function convertAiFixtures(
    level: number,
    fixtures: readonly AiLayoutFixture[],
    gridMm: number,
): Fixture[] {
    return fixtures.map((f, i) => ({
        id: `fix-ai-${level.toString()}-${i.toString()}`,
        kind: f.kind,
        pos: { x: Math.round(f.x * gridMm), y: Math.round(f.y * gridMm) },
        rotation: f.rotation,
    }));
}
