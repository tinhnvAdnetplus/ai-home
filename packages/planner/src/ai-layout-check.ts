import { type PlanInput } from './types.js';
import { type AiLayout } from './ai-layout-schema.js';
import { splitConnectedRects } from './room-components.js';
import { buildableDepthM } from './site-layout.js';
import { rectsTouchSun, sunEdge } from './sun-side.js';
import { checkFloorDoors } from './ai-layout-check-doors.js';
import { checkFloorFixtures } from './ai-layout-check-fixtures.js';
import {
    checkFloorReach,
    checkFloorStairsLanding,
} from './ai-layout-check-access.js';
import {
    checkFloorWindows,
    checkAiExterior,
} from './ai-layout-check-windows.js';

export function layoutLimits(input: PlanInput): { maxW: number; maxD: number } {
    return {
        maxW: Math.max(6, Math.floor((input.frontage - 1.0) / 0.91)),
        maxD: Math.max(6, Math.floor(buildableDepthM(input) / 0.91)),
    };
}

/** Structural checks the AI layout must pass before it is turned into a plan (messages go back to the AI).
 * `shouldRequireDoors` is only turned on for genuine AI-endpoint submissions — the internal
 * lot-first solver reuses this same checker but still computes doors procedurally. */
export function checkAiLayout(
    layout: AiLayout,
    input: PlanInput,
    options?: { readonly shouldRequireDoors?: boolean },
): string[] {
    const errors: string[] = [];
    const { maxW, maxD } = layoutLimits(input);
    if (layout.floors.length !== input.floors) {
        errors.push(
            `階数が${input.floors.toString()}階の指定と一致しません（${layout.floors.length.toString()}階分の出力）。`,
        );
    }
    if (layout.gridW > maxW)
        errors.push(
            `gridW=${layout.gridW.toString()} は敷地の最大幅 ${maxW.toString()} ブロックを超えています。`,
        );
    const d1 = layout.floors[0]?.gridD ?? 0;
    if (d1 > maxD)
        errors.push(
            `1階gridD=${d1.toString()} は敷地の最大奥行 ${maxD.toString()} ブロックを超えています。`,
        );
    // The 2nd floor sits ON the 1st floor's structure, so it can be the same depth or shallower
    // (下屋/shed-roof style) but never deeper — there is nothing underneath to hold it up.
    const d2 = layout.floors[1]?.gridD;
    if (d2 !== undefined && d2 > d1)
        errors.push(
            `2階gridD=${d2.toString()}が1階gridD=${d1.toString()}より大きくなっています。2階は1階の外形の内側に収まる必要があり、1階より奥行きを大きくすることはできません（同じか、それより浅く）。`,
        );
    for (const fl of layout.floors) {
        const tag = `${fl.level.toString()}階`;
        const owner = new Map<string, string>();
        for (const r of fl.rooms) {
            for (const rc of r.rects) {
                if (rc.x + rc.w > layout.gridW || rc.y + rc.h > fl.gridD) {
                    errors.push(
                        `${tag}「${r.name}」の矩形(${rc.x.toString()},${rc.y.toString()},${rc.w.toString()},${rc.h.toString()})が外形 ${layout.gridW.toString()}×${fl.gridD.toString()} からはみ出しています。`,
                    );
                    continue;
                }
                for (let x = rc.x; x < rc.x + rc.w; x++) {
                    for (let y = rc.y; y < rc.y + rc.h; y++) {
                        const k = `${x.toString()},${y.toString()}`;
                        const prev = owner.get(k);
                        if (
                            prev !== undefined &&
                            prev !== r.key &&
                            errors.length < 12
                        ) {
                            errors.push(
                                `${tag} セル(${k})が「${prev}」と「${r.name}」で重複しています。`,
                            );
                        }
                        owner.set(k, r.key);
                    }
                }
            }
            if (splitConnectedRects(r.rects).length > 1) {
                errors.push(
                    `${tag}「${r.name}」の矩形が離れています（1つの部屋は連続した矩形にしてください）。`,
                );
            }
        }
        const gaps: string[] = [];
        for (let y = 0; y < fl.gridD; y++) {
            for (let x = 0; x < layout.gridW; x++) {
                if (!owner.has(`${x.toString()},${y.toString()}`))
                    gaps.push(`(${x.toString()},${y.toString()})`);
            }
        }
        if (gaps.length > 0) {
            errors.push(
                `${tag} どの部屋にも属さない空きセルが${gaps.length.toString()}個あります（例: ${gaps.slice(0, 6).join(' ')}）。外形をすき間なく部屋で埋めてください。`,
            );
        }
        const keys = new Set<string>();
        for (const r of fl.rooms) {
            if (keys.has(r.key))
                errors.push(`${tag} key「${r.key}」が重複しています。`);
            keys.add(r.key);
        }
        errors.push(
            ...checkFloorDoors(fl, tag, options?.shouldRequireDoors ?? false),
        );
        errors.push(...checkFloorFixtures(fl, tag));
        errors.push(...checkFloorWindows(fl, layout.gridW, tag));
        errors.push(...checkFloorStairsLanding(fl, layout.gridW, tag));
        // Without AI doors (the internal solver) closed rooms have no links yet to walk.
        if (options?.shouldRequireDoors)
            errors.push(...checkFloorReach(fl, tag));
    }
    errors.push(...checkAiExterior(layout));
    const f1 = layout.floors[0];
    if (f1) {
        const entrances = f1.rooms.filter((r) => r.type === 'entrance');
        if (entrances.length !== 1)
            errors.push('1階に玄関(entrance)をちょうど1つ配置してください。');
        else if (!entrances[0]?.rects.some((rc) => rc.y === 0))
            errors.push('玄関は道路側(y=0)に接してください。');
        const ldk = f1.rooms.find((r) => r.type === 'ldk');
        if (!ldk) errors.push('1階にLDK(ldk)がありません。');
        else if (
            !rectsTouchSun(ldk.rects, input.roadSide, layout.gridW, f1.gridD)
        )
            errors.push(
                `LDKが南側（lot.sunEdge = ${sunEdge(input.roadSide)}）の外周に接していません。採光のためLDKをその辺に接してください。`,
            );
    }
    if (layout.floors.length === 2) {
        const stairs = layout.floors.map((f) =>
            f.rooms.filter((r) => r.type === 'stairs'),
        );
        const [a, b] = [stairs[0]?.[0]?.rects[0], stairs[1]?.[0]?.rects[0]];
        if (stairs.some((s) => s.length !== 1) || !a || !b)
            errors.push('各階に階段(stairs)をちょうど1つ配置してください。');
        else if (a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h)
            errors.push('階段は1階と2階で同じ位置・同じ矩形にしてください。');
        else if (!((a.w === 2 && a.h === 3) || (a.w === 3 && a.h === 2)))
            errors.push('階段は2×3ブロック(1.82m×2.73m)にしてください。');
    }
    return errors;
}
