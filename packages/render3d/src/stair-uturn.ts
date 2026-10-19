import * as THREE from 'three';
import { type Floor, type Stair } from '@aihome/bdm';
import { toThreeX, toThreeY, toThreeZ } from './coords.js';
import { addBox } from './stair-parts.js';
import { buildStairRail } from './stair-rail.js';
import { type MaterialRegistry } from './types.js';

const STEPS_PER_FLIGHT = 7;

/**
 * U-turn (折り返し) stair with a landing: two flights of 7 steps side by side joined by a
 * landing at the closed (min y) end; people enter and leave at the open (max y) end. Wood
 * treads + thin risers, with slim baluster-and-rail guards (never a solid panel, so the stair
 * never reads as a partition wall boxing itself in).
 *
 * Local depth coordinate t runs 0 (open end) -> depthM (landing end); z(t) = zOpen + t, since
 * z = -yMm*0.001 increases as y decreases from the open end toward the landing.
 */
export function buildUturnStair(
    stair: Stair,
    floor: Floor,
    reg: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    const xs = stair.polygon.map((p) => p.x);
    const ys = stair.polygon.map((p) => p.y);
    const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
    const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
    const widthM = (maxX - minX) * 0.001;
    const depthM = (maxY - minY) * 0.001;
    if (widthM < 0.5 || depthM < 1) return group;

    const flightW = widthM / 2;
    const landingD = flightW;
    const treadD = (depthM - landingD) / STEPS_PER_FLIGHT;
    const riseM = (floor.heightMm > 0 ? floor.heightMm : 2800) * 0.001;
    const stepH = riseM / (STEPS_PER_FLIGHT * 2);
    const baseY = toThreeY(floor.elevationMm);
    const x0 = toThreeX(minX);
    const zOpen = toThreeZ(maxY);
    const zOf = (t: number): number => zOpen + t;
    const wood = reg.woodAccent;
    const riser = reg.wallInterior;

    for (let i = 0; i < STEPS_PER_FLIGHT; i += 1) {
        const t = (i + 0.5) * treadD;
        const flights: readonly [number, number][] = [
            [i, x0 + flightW / 2],
            [STEPS_PER_FLIGHT * 2 - 1 - i, x0 + flightW * 1.5],
        ];
        for (const [step, xc] of flights) {
            const top = baseY + (step + 1) * stepH;
            addBox(
                group,
                reg,
                wood,
                [flightW - 0.1, 0.04, treadD + 0.03],
                [xc, top - 0.02, zOf(t)],
            );
            addBox(
                group,
                reg,
                riser,
                [flightW - 0.14, stepH - 0.04, 0.02],
                [xc, top - 0.04 - (stepH - 0.04) / 2, zOf(t + treadD / 2)],
            );
        }
    }

    const landTop = baseY + STEPS_PER_FLIGHT * stepH;
    const tLand = STEPS_PER_FLIGHT * treadD + landingD / 2;
    addBox(
        group,
        reg,
        wood,
        [widthM, 0.06, landingD],
        [x0 + widthM / 2, landTop - 0.03, zOf(tLand)],
    );

    buildStairRail(group, reg, {
        x0,
        flightW,
        baseY,
        stepH,
        zOf,
        treadD,
        stepsPerFlight: STEPS_PER_FLIGHT,
        landTop,
        tLand,
        landingD,
    });

    return group;
}
