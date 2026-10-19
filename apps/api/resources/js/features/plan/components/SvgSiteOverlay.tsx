import { useTranslation } from 'react-i18next';
import { type Site } from '@aihome/bdm';
import { pointsToSvgString } from '../lib/svg-geometry';
import { type ViewportBounds } from '../types/plan-view-types';
import { northArrowPose } from '../lib/north-arrow';

type SvgSiteOverlayProps = {
    readonly site: Site;
    readonly viewBox: ViewportBounds;
};

export function SvgSiteOverlay({
    site,
    viewBox,
}: SvgSiteOverlayProps): React.JSX.Element {
    const { t } = useTranslation();
    const boundaryPoints = pointsToSvgString(site.boundary);

    const northX = viewBox.minX + viewBox.width - 900;
    const northY = viewBox.minY + 900;
    const north = northArrowPose(site.road.side);
    const northLabel = north.labelAt(420);

    const scaleX = viewBox.minX + 900;
    const scaleY = viewBox.minY + viewBox.height - 700;

    return (
        <g className="site-overlay">
            <polygon
                points={boundaryPoints}
                fill="#f8fafc"
                stroke="#94a3b8"
                strokeWidth={40}
                strokeDasharray="160 80"
            />

            <rect
                x={viewBox.minX + 400}
                y={viewBox.minY + 300}
                width={2800}
                height={450}
                rx={80}
                fill="#e2e8f0"
                opacity={0.8}
            />
            <text
                x={viewBox.minX + 550}
                y={viewBox.minY + 600}
                fontSize={240}
                fontWeight="bold"
                fill="#475569"
            >
                {t('plan:roadSideNotice', { side: site.road.side })}
            </text>

            <g
                transform={`translate(${northX.toString()}, ${northY.toString()})`}
            >
                <circle
                    r={320}
                    fill="#ffffff"
                    stroke="#94a3b8"
                    strokeWidth={30}
                />
                <path
                    d="M 0 -240 L 90 120 L 0 60 L -90 120 Z"
                    fill="#0f172a"
                    transform={north.rotate}
                />
                <text
                    x={northLabel.x}
                    y={northLabel.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={220}
                    fontWeight="bold"
                    fill="#0f172a"
                >
                    {t('plan:north')}
                </text>
            </g>

            <g
                transform={`translate(${scaleX.toString()}, ${scaleY.toString()})`}
            >
                <rect x={0} y={0} width={2000} height={60} fill="#0f172a" />
                <rect x={1000} y={0} width={1000} height={60} fill="#cbd5e1" />
                <line
                    x1={0}
                    y1={-40}
                    x2={0}
                    y2={100}
                    stroke="#0f172a"
                    strokeWidth={30}
                />
                <line
                    x1={1000}
                    y1={-40}
                    x2={1000}
                    y2={100}
                    stroke="#0f172a"
                    strokeWidth={30}
                />
                <line
                    x1={2000}
                    y1={-40}
                    x2={2000}
                    y2={100}
                    stroke="#0f172a"
                    strokeWidth={30}
                />
                <text x={0} y={-80} fontSize={200} fill="#475569">
                    0
                </text>
                <text
                    x={1000}
                    y={-80}
                    fontSize={200}
                    textAnchor="middle"
                    fill="#475569"
                >
                    1{t('plan:meterUnit')}
                </text>
                <text
                    x={2000}
                    y={-80}
                    fontSize={200}
                    textAnchor="end"
                    fill="#475569"
                >
                    2{t('plan:meterUnit')}
                </text>
            </g>
        </g>
    );
}
