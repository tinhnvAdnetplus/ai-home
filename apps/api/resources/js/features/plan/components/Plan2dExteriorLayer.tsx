import { useTranslation } from 'react-i18next';
import { type Site, type Parking, type Exterior } from '@aihome/bdm';
import { pointsToSvgString } from '../lib/svg-geometry';
import { computePointsBounds } from '../lib/plan2d-geometry';
import { Plan2dLandscapeSymbols } from './Plan2dLandscapeSymbols';

type Plan2dExteriorLayerProps = {
    readonly site: Site;
    readonly parking?: Parking | undefined;
    readonly exterior?: Exterior | undefined;
};

export function Plan2dExteriorLayer({
    site,
    parking,
    exterior,
}: Plan2dExteriorLayerProps): React.JSX.Element {
    const { t } = useTranslation();
    const boundaryPoints = pointsToSvgString(site.boundary);
    const siteBounds = computePointsBounds(site.boundary);

    const parkingBounds = parking?.polygon
        ? computePointsBounds(parking.polygon)
        : null;
    const scaleX = siteBounds.minX + 100;
    const scaleY = siteBounds.maxY + 500;

    return (
        <g className="plan2d-exterior">
            {/* Site boundary */}
            <polygon
                points={boundaryPoints}
                fill="none"
                stroke="#c4ccc6"
                strokeWidth={30}
                strokeDasharray="160 80"
            />

            {exterior ? <Plan2dLandscapeSymbols exterior={exterior} /> : null}

            {/* Parking space */}
            {parkingBounds ? (
                <g className="exterior-parking">
                    <rect
                        x={parkingBounds.minX}
                        y={parkingBounds.minY}
                        width={parkingBounds.width}
                        height={parkingBounds.height}
                        fill="#f4f5f2"
                        stroke="#c4ccc6"
                        strokeWidth={24}
                        strokeDasharray="160 100"
                    />
                    <rect
                        x={parkingBounds.minX + 200}
                        y={parkingBounds.minY + parkingBounds.height / 2 - 800}
                        width={Math.max(600, parkingBounds.width - 400)}
                        height={1600}
                        rx={240}
                        fill="none"
                        stroke="#cdd4ce"
                        strokeWidth={26}
                    />
                    <rect
                        x={parkingBounds.minX + 350}
                        y={parkingBounds.minY + parkingBounds.height / 2 - 500}
                        width={Math.max(400, parkingBounds.width - 700)}
                        height={1000}
                        rx={140}
                        fill="none"
                        stroke="#dde2dd"
                        strokeWidth={20}
                    />
                    <text
                        x={parkingBounds.minX + parkingBounds.width / 2}
                        y={parkingBounds.minY + parkingBounds.height / 2 + 50}
                        textAnchor="middle"
                        fontSize={220}
                        fill="#8a938c"
                    >
                        {t('plan:parkingSpace')}
                    </text>
                </g>
            ) : null}

            {/* Scale bar (S=1:100) */}
            <g
                transform={`translate(${scaleX.toString()}, ${scaleY.toString()})`}
            >
                <rect x={0} y={0} width={2000} height={50} fill="#2f3a34" />
                <rect x={1000} y={0} width={1000} height={50} fill="#cbd5e1" />
                <line
                    x1={0}
                    y1={-30}
                    x2={0}
                    y2={80}
                    stroke="#2f3a34"
                    strokeWidth={24}
                />
                <line
                    x1={1000}
                    y1={-30}
                    x2={1000}
                    y2={80}
                    stroke="#2f3a34"
                    strokeWidth={24}
                />
                <line
                    x1={2000}
                    y1={-30}
                    x2={2000}
                    y2={80}
                    stroke="#2f3a34"
                    strokeWidth={24}
                />
                <text x={0} y={-60} fontSize={180} fill="#64748b">
                    0
                </text>
                <text
                    x={1000}
                    y={-60}
                    fontSize={180}
                    textAnchor="middle"
                    fill="#64748b"
                >
                    1{t('plan:meterUnit')}
                </text>
                <text
                    x={2000}
                    y={-60}
                    fontSize={180}
                    textAnchor="end"
                    fill="#64748b"
                >
                    2{t('plan:meterUnit')}
                </text>
            </g>
        </g>
    );
}
