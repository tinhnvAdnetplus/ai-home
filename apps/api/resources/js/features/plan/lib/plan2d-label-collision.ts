import {
    type LabelLayout,
    computeLabelBox as computeBox,
} from './plan2d-label-types';

export function resolveLabelOverlaps(layouts: LabelLayout[]): void {
    for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < layouts.length; i++) {
            for (let j = i + 1; j < layouts.length; j++) {
                const a = layouts[i];
                const b = layouts[j];
                if (!a || !b) continue;

                const isOverlap =
                    a.box.minX < b.box.maxX &&
                    a.box.maxX > b.box.minX &&
                    a.box.minY < b.box.maxY &&
                    a.box.maxY > b.box.minY;

                if (isOverlap) {
                    if (a.hasJo || b.hasJo) {
                        a.hasJo = false;
                        b.hasJo = false;
                    } else {
                        a.fontSize = Math.max(
                            110,
                            Math.round(a.fontSize * 0.85),
                        );
                        b.fontSize = Math.max(
                            110,
                            Math.round(b.fontSize * 0.85),
                        );
                        const dy = Math.round(a.fontSize * 0.4);
                        a.y -= dy;
                        b.y += dy;
                    }
                    a.box = computeBox(
                        a.x,
                        a.y,
                        a.name,
                        a.fontSize,
                        a.hasJo,
                    );
                    b.box = computeBox(
                        b.x,
                        b.y,
                        b.name,
                        b.fontSize,
                        b.hasJo,
                    );
                }
            }
        }
    }
}
