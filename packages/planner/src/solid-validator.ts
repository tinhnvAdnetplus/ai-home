import {
    type BdmIssue,
    type BuildingModel,
    type Rect2,
    resolveWallSpans,
    wallSolidRect,
    wallThicknessMm,
} from '@aihome/bdm';
import { checkFixtures } from './solid-checks-fixtures.js';
import { checkRoof, checkStairs, checkStoreys } from './solid-checks-levels.js';
import { checkOpenings } from './solid-checks-openings.js';
import { checkSite } from './solid-checks-site.js';
import { checkSlabs, checkWalls, footprintOf } from './solid-checks-walls.js';
import {
    type Ctx,
    type SolidFinding,
    type SolidValidationReport,
} from './solid-context.js';

export {
    SLIDING_DOOR_CLEAR_DEPTH_MM,
    MAX_SWING_DEPTH_MM,
    type SolidFinding,
    type SolidValidationReport,
} from './solid-context.js';
export { doorClearZone, isDoorKind } from './solid-door-zone.js';

/**
 * Deterministic 3D consistency checks on a BuildingModel (canonical mm, see bdm
 * `coordinates.ts`). Every element is reduced to the simplest reliable solid: walls are
 * axis-aligned boxes over their junction-resolved span (bdm `wall-joints.ts`) and full storey
 * height; fixtures are catalog footprints standing on their storey's floor; openings are slots
 * [offset, offset+width] x [sill, sill+height] in their host wall; stairs/rooms are footprints
 * with the storey's Z range.
 *
 * Contact is not collision. Explicitly ALLOWED relationships (counted, never reported):
 * wall-on-slab, wall-to-wall junction faces, opening inside its host wall, stair foot on its
 * floor + head in the upper stairwell, roof on the top-storey wall plate, deck/approach attached
 * to the outer half of an exterior wall.
 *
 * Fixture heights are not modelled anywhere in the BDM, so nothing here claims a fixture clears
 * a ceiling, window sill or wall-mounted element; a fixture-vs-wall or fixture-vs-fixture verdict
 * IS exact in Z because both stand on the same floor (their Z ranges always overlap from the
 * floor up). Everything that could not be decided is listed in `incomplete`.
 */

/** At most this many object ids are listed in one grouped issue message. */
const MAX_IDS_PER_ISSUE = 3;

function groupIssues(findings: readonly SolidFinding[]): BdmIssue[] {
    const groups = new Map<string, SolidFinding[]>();
    for (const f of findings) {
        const key = `${f.code}@${String(f.floorLevel)}`;
        const list = groups.get(key) ?? [];
        list.push(f);
        groups.set(key, list);
    }
    const out: BdmIssue[] = [];
    for (const list of groups.values()) {
        const first = list[0];
        if (!first) continue;
        const extra =
            list.length > MAX_IDS_PER_ISSUE
                ? `（他${(list.length - MAX_IDS_PER_ISSUE).toString()}件）`
                : '';
        const where =
            first.floorLevel === null
                ? ''
                : `${first.floorLevel.toString()}階: `;
        out.push({
            path: ['solids', first.floorLevel ?? 0, first.code],
            code: first.code,
            message: `${where}${list
                .slice(0, MAX_IDS_PER_ISSUE)
                .map((f) => f.detail)
                .join('／')}${extra}`,
            level: first.level,
        });
    }
    return out;
}

export function validateSolids(model: BuildingModel): SolidValidationReport {
    const ctx: Ctx = { findings: [], incomplete: new Set(), allowed: 0 };
    const floors = [...model.floors].sort((a, b) => a.level - b.level);
    const footprints = new Map<number, Rect2 | null>();
    let groundSolid: Rect2 | null = null;
    let groundCentreline: Rect2 | null = null;

    for (const floor of floors) {
        const spans = resolveWallSpans(floor.walls);
        const solids = new Map<string, Rect2>();
        for (const w of floor.walls) {
            const span = spans.get(w.id);
            const r = span ? wallSolidRect(w, span) : null;
            if (r) solids.set(w.id, r);
        }
        const exterior = new Map(
            [...solids].filter(
                ([id]) =>
                    floor.walls.find((w) => w.id === id)?.kind === 'exterior',
            ),
        );
        footprints.set(floor.level, footprintOf(exterior));
        if (floor === floors[0]) {
            groundSolid = footprintOf(exterior);
            const ext = floor.walls.filter((w) => w.kind === 'exterior');
            if (ext.length > 0) {
                const half = Math.max(...ext.map(wallThicknessMm)) / 2;
                groundCentreline = groundSolid && {
                    minX: groundSolid.minX + half,
                    maxX: groundSolid.maxX - half,
                    minY: groundSolid.minY + half,
                    maxY: groundSolid.maxY - half,
                };
            }
        }
        checkWalls(floor, solids, ctx);
        checkOpenings(floor, solids, ctx);
        checkFixtures(floor, solids, ctx);
        checkSlabs(floor, ctx);
    }
    checkStoreys(floors, footprints, ctx);
    checkStairs(floors, ctx);
    checkRoof(model, footprints, ctx);
    checkSite(model, groundSolid, groundCentreline, ctx);

    return {
        findings: ctx.findings,
        issues: groupIssues(ctx.findings),
        allowedContacts: ctx.allowed,
        incomplete: [...ctx.incomplete],
        isApproximate: true,
    };
}
