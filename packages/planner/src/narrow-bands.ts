import { type BandItem, type BandSpec } from './grid-types.js';

export type NarrowOptions = {
    /** where the 1-cell corridor column sits inside every split row */
    readonly fillerPos: 'start' | 'mid' | 'end';
    /** give the LDK row its own corridor cell so the LDK opens onto the hall */
    readonly hasLdkHall: boolean;
};

export const DEFAULT_NARROW: NarrowOptions = {
    fillerPos: 'end',
    hasLdkHall: false,
};

function itemMin(it: BandItem): number {
    return it.min ?? 1;
}

function makeFiller(): BandItem {
    return {
        w: 1,
        min: 0,
        max: 1,
        flex: 2,
        tag: '廊下',
        rooms: [
            {
                key: 'hall',
                name: 'ホール',
                type: 'hall',
                isMerge: true,
                d: 'fill',
            },
        ],
    };
}

function withFiller(
    items: readonly BandItem[],
    pos: NarrowOptions['fillerPos'],
): BandItem[] {
    const widened = items.map((it) => ({
        ...it,
        max: Math.max(it.max ?? it.w, it.w + 2),
    }));
    const at =
        pos === 'start'
            ? 0
            : pos === 'end'
              ? widened.length
              : Math.floor(widened.length / 2);
    return [...widened.slice(0, at), makeFiller(), ...widened.slice(at)];
}

function groupItems(items: readonly BandItem[], maxW: number): BandItem[][] {
    const groups: BandItem[][] = [];
    let cur: BandItem[] = [];
    let curMin = 0;
    for (const it of items) {
        const m = itemMin(it);
        if (cur.length > 0 && curMin + m > maxW) {
            groups.push(cur);
            cur = [];
            curMin = 0;
        }
        cur.push(it);
        curMin += m;
    }
    if (cur.length > 0) groups.push(cur);
    return groups;
}

function splitBand(
    band: BandSpec,
    maxW: number,
    opts: NarrowOptions,
): BandSpec[] {
    const groups = groupItems(band.items, maxW);
    if (groups.length <= 1) return [band];
    const ldkIdx = groups.findIndex((g) => g.some((it) => it.tag === 'LDK'));
    const entIdx = groups.findIndex((g) =>
        g.some((it) => it.rooms.some((r) => r?.type === 'entrance')),
    );
    let ordered =
        band.isLdk && ldkIdx >= 0
            ? [...groups.filter((_, i) => i !== ldkIdx), groups[ldkIdx] ?? []]
            : entIdx > 0
              ? [groups[entIdx] ?? [], ...groups.filter((_, i) => i !== entIdx)]
              : groups;
    if (opts.hasLdkHall && band.isLdk && ordered.length > 1) {
        const last = ordered[ordered.length - 1] ?? [];
        const keep = last.filter((it) => it.tag === 'LDK');
        const moved = last.filter(
            (it) => it.tag !== 'LDK' && (it.flex ?? 0) === 0,
        );
        const prev = ordered[ordered.length - 2] ?? [];
        ordered = [...ordered.slice(0, -2), [...prev, ...moved], keep];
    }
    return ordered.map((items0, i) => {
        const hasLdk = items0.some((it) => it.tag === 'LDK');
        const items =
            hasLdk && !opts.hasLdkHall
                ? items0
                : withFiller(items0, opts.fillerPos);
        return {
            name: `${band.name}-r${i.toString()}`,
            depth: hasLdk ? band.depth : Math.min(band.depth, 4),
            items,
            isLdk: band.isLdk && hasLdk,
            hallKey: band.hallKey,
        };
    });
}

/** Re-flow bands whose minimum widths exceed the lot width into extra rows (deeper, narrower house). */
export function splitWideBands(
    bands: readonly BandSpec[],
    maxW: number,
    opts: NarrowOptions = DEFAULT_NARROW,
): BandSpec[] {
    return bands.flatMap((b) => splitBand(b, maxW, opts));
}
