import { useTranslation } from 'react-i18next';
import { type Floor, type Site } from '@aihome/bdm';
import { type RoomBounds } from '../lib/plan2d-types';
import { northArrowPose } from '../lib/north-arrow';
import { measureTextUnits } from '../lib/plan2d-label-types';

type Plan2dAnnotationsProps = {
    readonly floor: Floor;
    readonly site: Site;
    readonly planLabel?: string | undefined;
    readonly bounds: RoomBounds;
    readonly northX: number;
    readonly northY: number;
};

export function Plan2dAnnotations({
    floor,
    site,
    planLabel,
    bounds,
    northX,
    northY,
}: Plan2dAnnotationsProps): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);
    const north = northArrowPose(site.road.side);
    const northLabel = north.labelAt(660);
    const floorAreaM2 = floor.rooms.reduce((sum, r) => sum + r.areaM2, 0);
    const floorAreaTsubo = (floorAreaM2 / 3.305785).toFixed(2);

    const sheetTitleText = t('plan:sheetTitle', {
        label:
            planLabel !== undefined && planLabel !== '' ? `${planLabel} ` : '',
        floor: t('plan:floorFormat', { level: floor.level }),
        title: t('plan:viewerTitle'),
    });
    const sheetMetaText = t('plan:sheetMeta', {
        scale: t('plan:scaleRatio'),
        area: t('plan:floorAreaLabel', {
            area: floorAreaM2.toFixed(1),
            tsubo: floorAreaTsubo,
        }),
        module: t('plan:moduleText'),
    });

    const titleFontSize = 240;
    const metaFontSize = 195;
    const requiredTextW = Math.ceil(
        Math.max(
            measureTextUnits(sheetTitleText) * titleFontSize,
            measureTextUnits(sheetMetaText) * metaFontSize,
        ) + 400,
    );
    const titleBlockW = Math.max(4800, requiredTextW);
    const titleBlockX = bounds.maxX - titleBlockW;
    const titleBlockY = bounds.maxY + 850;
    const roadTextX = Math.max(
        (bounds.minX + bounds.maxX) / 2,
        bounds.minX + 3600,
    );

    return (
        <g className="plan2d-annotations">
            <g
                transform={`translate(${northX.toString()}, ${northY.toString()})`}
            >
                <circle
                    r={520}
                    fill="#ffffff"
                    stroke="#d3dad5"
                    strokeWidth={24}
                />
                <path
                    d="M 0 -380 L 140 120 L 0 40 L -140 120 Z"
                    fill="#2f3a34"
                    transform={north.rotate}
                />
                <text
                    x={northLabel.x}
                    y={northLabel.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={260}
                    fontWeight="bold"
                    fill="#16a34a"
                >
                    {t('plan:north')}
                </text>
            </g>

            <text
                x={roadTextX}
                y={bounds.maxY + 550}
                textAnchor="middle"
                fontSize={250}
                fill="#8a938c"
            >
                {t('plan:roadSideIndicator', { side: site.road.side })}
            </text>

            <g className="sheet-title-block">
                <rect
                    x={titleBlockX}
                    y={titleBlockY}
                    width={titleBlockW}
                    height={850}
                    rx={16}
                    fill="#f7faf8"
                    stroke="#d3dad5"
                    strokeWidth={20}
                />
                <text
                    x={titleBlockX + 180}
                    y={titleBlockY + 320}
                    fontSize={titleFontSize}
                    fontWeight="bold"
                    fill="#2f3a34"
                >
                    {sheetTitleText}
                </text>
                <text
                    x={titleBlockX + 180}
                    y={titleBlockY + 640}
                    fontSize={metaFontSize}
                    fill="#64748b"
                >
                    {sheetMetaText}
                </text>
            </g>
        </g>
    );
}

