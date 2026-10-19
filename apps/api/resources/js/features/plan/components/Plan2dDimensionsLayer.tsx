import { type Exterior, type Floor, type Parking, type Site } from '@aihome/bdm';
import {
    collectExteriorPoints,
    computeDimensionChains,
    computeFloorBounds,
    computePointsBounds,
} from '../lib/plan2d-geometry';
import { Plan2dTopDimensionChain } from './Plan2dTopDimensionChain';
import { Plan2dLeftDimensionChain } from './Plan2dLeftDimensionChain';
import { Plan2dAnnotations } from './Plan2dAnnotations';

type Plan2dDimensionsLayerProps = {
    readonly floor: Floor;
    readonly site: Site;
    readonly parking?: Parking | undefined;
    readonly exterior?: Exterior | undefined;
    readonly planLabel?: string | undefined;
};

export function Plan2dDimensionsLayer({
    floor,
    site,
    parking,
    exterior,
    planLabel,
}: Plan2dDimensionsLayerProps): React.JSX.Element {
    const bounds = computeFloorBounds(floor);
    const outerBounds =
        floor.level === 1
            ? computePointsBounds([
                  ...collectExteriorPoints(site, parking, exterior),
                  { x: bounds.minX, y: bounds.minY },
                  { x: bounds.maxX, y: bounds.maxY },
              ])
            : bounds;
    const { topChain, leftChain } = computeDimensionChains(floor, outerBounds);

    const northX = outerBounds.maxX + 600;
    const northY = topChain.offset - 500;

    return (
        <g className="plan2d-dimensions">
            <Plan2dTopDimensionChain topChain={topChain} minY={bounds.minY} />
            <Plan2dLeftDimensionChain
                leftChain={leftChain}
                minX={bounds.minX}
            />
            <Plan2dAnnotations
                floor={floor}
                site={site}
                planLabel={planLabel}
                bounds={outerBounds}
                northX={northX}
                northY={northY}
            />
        </g>
    );
}
