import { type BuildingModel, type Polygon } from '@aihome/bdm';

export function shoelaceAreaM2(polygon: Polygon): number {
    if (polygon.length < 3) return 0;
    let sum = 0;
    for (let i = 0; i < polygon.length; i++) {
        const cur = polygon[i];
        const next = polygon[(i + 1) % polygon.length];
        if (cur && next) {
            sum += cur.x * next.y - next.x * cur.y;
        }
    }
    return Math.abs(sum) / 2_000_000;
}

export function computeModelTotalAreaTsubo(model: BuildingModel): number {
    let totalM2 = 0;
    for (const floor of model.floors) {
        for (const room of floor.rooms) {
            totalM2 += shoelaceAreaM2(room.polygon);
        }
    }
    return Math.round((totalM2 / 3.305785) * 10) / 10;
}

export function computeLdkJo(model: BuildingModel): number {
    for (const floor of model.floors) {
        const ldk = floor.rooms.find((r) => r.type === 'ldk');
        if (ldk) {
            return (
                Math.round((shoelaceAreaM2(ldk.polygon) / 1.65289) * 10) / 10
            );
        }
    }
    return 0;
}

export function computeBedroomCount(model: BuildingModel): number {
    let count = 0;
    for (const floor of model.floors) {
        for (const r of floor.rooms) {
            if (r.type === 'bedroom' || r.type === 'childRoom') {
                count += 1;
            }
        }
    }
    return count;
}

export function computeBathSizeLabel(model: BuildingModel): string {
    for (const floor of model.floors) {
        const bath = floor.rooms.find((r) => r.type === 'bath');
        if (bath) {
            const tsubo = shoelaceAreaM2(bath.polygon) / 3.305785;
            if (tsubo >= 1.4) return '1.5坪';
            if (tsubo >= 1.15) return '1.25坪';
            return '1坪';
        }
    }
    return '1坪';
}

export function computeStorageCount(model: BuildingModel): number {
    let count = 0;
    for (const floor of model.floors) {
        for (const r of floor.rooms) {
            if (
                r.type === 'storage' ||
                r.type === 'closet' ||
                r.type === 'walkInCloset' ||
                r.type === 'pantry'
            ) {
                count += 1;
            }
        }
    }
    return count;
}

export function getRecommendedPlanId(
    plans: readonly {
        readonly id: string;
        readonly label: string;
        readonly score: { readonly total: number };
    }[],
    recLabel?: string,
): string {
    if (recLabel) {
        const m = plans.find(
            (p) =>
                p.label.includes(recLabel) ||
                p.id.toLowerCase().endsWith(recLabel.toLowerCase()),
        );
        if (m) return m.id;
    }
    let [max, id] = [-1, ''];
    for (const p of plans) {
        if (p.score.total > max) {
            max = p.score.total;
            id = p.id;
        }
    }
    return id;
}
