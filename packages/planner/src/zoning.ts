import { type BandItem, type BandSpec, type RoomSpec } from './grid-types.js';

export function hallRoom(key: string, d: number): RoomSpec {
    return { key, name: 'ホール', type: 'hall', isMerge: true, d };
}

function itemMin(it: BandItem): number {
    return it.min ?? 1;
}

export function assembleBands(
    bandList: readonly BandSpec[],
    maxW: number,
    isEntryFirst: boolean,
    report: { isSplit: boolean },
): BandSpec[] {
    const out: BandSpec[] = [];
    for (const originalBand of bandList) {
        const b: BandSpec = {
            name: originalBand.name,
            depth: originalBand.depth,
            items: [...originalBand.items],
            core: originalBand.core ? [...originalBand.core] : null,
            service: originalBand.service ? [...originalBand.service] : null,
            tail: originalBand.tail ? [...originalBand.tail] : null,
            hallKey: originalBand.hallKey,
            isLdk: originalBand.isLdk,
        };

        if (!b.tail || !b.core || !b.service) {
            out.push(b);
            continue;
        }

        const hallKey = b.hallKey ?? 'hall';
        const withCorridor = (items: BandItem[]): BandItem[] => {
            if (b.depth <= 2) return items;
            for (const it of items) {
                const totalD = it.rooms.reduce(
                    (acc, r) => acc + (r && typeof r.d === 'number' ? r.d : 0),
                    0,
                );
                if (totalD < b.depth) {
                    it.rooms = [
                        ...it.rooms,
                        hallRoom(hallKey, b.depth - totalD),
                    ];
                }
            }
            return items;
        };

        const coreMin = b.core.reduce((a, it) => a + itemMin(it), 0);
        const svcMin = b.service.reduce((a, it) => a + itemMin(it), 0);
        const tailMin = b.tail.reduce((a, it) => a + itemMin(it), 0);

        if (coreMin + svcMin + tailMin <= maxW || b.service.length === 0) {
            b.items = [...withCorridor([...b.core, ...b.service]), ...b.tail];
            out.push(b);
        } else {
            b.items = [...withCorridor([...b.core]), ...b.tail];
            out.push(b);
            const svc = [...b.service];
            const svcWidth = svc.reduce((a, it) => a + itemMin(it), 0);
            const remainingWidth = Math.max(0, maxW - svcWidth);
            const corridorW = Math.min(1, remainingWidth);
            if (corridorW > 0) {
                svc.push({
                    w: corridorW,
                    min: corridorW,
                    max: corridorW,
                    flex: 0,
                    tag: '廊下',
                    rooms: [hallRoom(hallKey, 2)],
                });
            }
            const extraW = remainingWidth - corridorW;
            const pantryW = Math.min(2, extraW);
            if (pantryW > 0) {
                svc.push({
                    w: pantryW,
                    min: 0,
                    max: pantryW,
                    flex: 0,
                    tag: 'パントリー',
                    rooms: [
                        {
                            key: 'pantry',
                            name: 'パントリー',
                            type: 'pantry',
                            d: 2,
                        },
                    ],
                });
            }
            const remW = extraW - pantryW;
            if (remW > 0) {
                svc.push({
                    w: remW,
                    min: 0,
                    max: remW,
                    flex: 0,
                    tag: '収納',
                    rooms: [
                        { key: 'svcstore', name: '収納', type: 'closet', d: 2 },
                    ],
                });
            }
            out.push({ name: `${b.name}-svc`, depth: 2, items: svc });
            report.isSplit = true;
        }

        if (isEntryFirst && b.items.length > 1) {
            const last = b.items.pop();
            b.items.reverse();
            if (last) {
                b.items.push(last);
            }
        }
        b.core = null;
        b.service = null;
        b.tail = null;
    }
    return out;
}
