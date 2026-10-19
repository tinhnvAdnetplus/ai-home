import { type BandItem } from './grid-types.js';

function itemMin(it: BandItem): number {
    return it.min ?? 1;
}

export function packWidths(W: number, items: readonly BandItem[]): number[] {
    const w = items.map((it) =>
        Math.min(it.max ?? 99, Math.max(itemMin(it), it.w)),
    );
    const sum = (): number => w.reduce((a, b) => a + b, 0);

    let guard = 0;
    while (sum() < W && guard++ < 500) {
        let best = -1;
        let bestScore = -1;
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const flex = it?.flex ?? 0;
            const curW = w[i] ?? 0;
            if (flex <= 0 || curW >= (it?.max ?? 99)) continue;
            const sc = flex / (curW + 1);
            if (sc > bestScore) {
                bestScore = sc;
                best = i;
            }
        }
        if (best < 0) {
            for (let k = 0; k < items.length; k++) {
                const it = items[k];
                const curW = w[k] ?? 0;
                const isExpandable =
                    it &&
                    (it.tag === 'LDK' ||
                        it.tag === '主寝室' ||
                        it.tag === '子ども部屋' ||
                        it.tag.includes('玄関'));
                if (isExpandable && curW < (it.max ?? 99)) {
                    best = k;
                    break;
                }
            }
        }
        if (best < 0) break;
        const val = w[best];
        if (val !== undefined) w[best] = val + 1;
    }

    guard = 0;
    while (sum() > W && guard++ < 500) {
        let idx = -1;
        let cur = -1;
        for (let j = 0; j < items.length; j++) {
            const it = items[j];
            const curW = w[j] ?? 0;
            if (!it || curW <= itemMin(it)) continue;
            const v = (it.flex ?? 0.01) * curW;
            if (v > cur) {
                cur = v;
                idx = j;
            }
        }
        if (idx < 0) break;
        const val = w[idx];
        if (val !== undefined) w[idx] = val - 1;
    }
    return w;
}
