import { useTranslation } from 'react-i18next';
import { type Exterior } from '@aihome/bdm';
import { pointsToSvgString } from '../lib/svg-geometry';
import { computePointsBounds } from '../lib/plan2d-geometry';

type Plan2dLandscapeSymbolsProps = {
    readonly exterior: Exterior;
};

function buildStepPositions(
    minVal: number,
    maxVal: number,
    step: number,
    endPad: number,
): number[] {
    const out: number[] = [];
    for (let v = minVal + step; v < maxVal - endPad; v += step) {
        out.push(v);
    }
    return out;
}

export function Plan2dLandscapeSymbols({
    exterior,
}: Plan2dLandscapeSymbolsProps): React.JSX.Element {
    const { t } = useTranslation();
    const approachBounds =
        exterior.approachPolygon && exterior.approachPolygon.length >= 3
            ? computePointsBounds(exterior.approachPolygon)
            : null;
    const deckBounds =
        exterior.deckPolygon && exterior.deckPolygon.length >= 3
            ? computePointsBounds(exterior.deckPolygon)
            : null;

    const deckPlankYs = deckBounds
        ? buildStepPositions(deckBounds.minY, deckBounds.maxY, 180, 60)
        : [];
    const approachStepYs = approachBounds
        ? buildStepPositions(approachBounds.minY, approachBounds.maxY, 350, 100)
        : [];

    return (
        <g className="exterior-landscape">
            {exterior.approachPolygon && approachBounds ? (
                <g className="exterior-approach">
                    <polygon
                        points={pointsToSvgString(exterior.approachPolygon)}
                        fill="#ebe7df"
                        stroke="#c7bfb2"
                        strokeWidth={18}
                    />
                    {approachStepYs.map((y) => (
                        <line
                            key={`approach-step-${y.toString()}`}
                            x1={approachBounds.minX + 60}
                            y1={y}
                            x2={approachBounds.maxX - 60}
                            y2={y}
                            stroke="#d5cec2"
                            strokeWidth={14}
                        />
                    ))}
                </g>
            ) : null}

            {exterior.deckPolygon && deckBounds ? (
                <g className="exterior-deck">
                    <polygon
                        points={pointsToSvgString(exterior.deckPolygon)}
                        fill="#dfc298"
                        stroke="#9b7346"
                        strokeWidth={22}
                    />
                    {deckPlankYs.map((y) => (
                        <line
                            key={`deck-plank-${y.toString()}`}
                            x1={deckBounds.minX + 20}
                            y1={y}
                            x2={deckBounds.maxX - 20}
                            y2={y}
                            stroke="#c39a6b"
                            strokeWidth={10}
                        />
                    ))}
                    {deckBounds.width >= 1500 && deckBounds.height >= 900 ? (
                        <text
                            x={deckBounds.minX + deckBounds.width / 2}
                            y={deckBounds.minY + deckBounds.height / 2 + 55}
                            textAnchor="middle"
                            fontSize={180}
                            fontWeight={600}
                            fill="#6b4c2b"
                        >
                            {t('plan:rooms.deck')}
                        </text>
                    ) : null}
                </g>
            ) : null}

            {exterior.trees?.map((tree) => {
                const r = Math.max(300, tree.radiusMm);
                const innerR = Math.round(r * 0.68);
                const treeKey = `tree-${tree.pos.x.toString()}-${tree.pos.y.toString()}`;
                return (
                    <g key={treeKey} className="exterior-tree">
                        <circle
                            cx={tree.pos.x + 40}
                            cy={tree.pos.y + 50}
                            r={r}
                            fill="#94a398"
                            fillOpacity={0.18}
                        />
                        <circle
                            cx={tree.pos.x}
                            cy={tree.pos.y}
                            r={r}
                            fill="#d9ead3"
                            fillOpacity={0.82}
                            stroke="#6aa84f"
                            strokeWidth={20}
                        />
                        <circle
                            cx={tree.pos.x}
                            cy={tree.pos.y}
                            r={innerR}
                            fill="#eef7eb"
                            fillOpacity={0.7}
                            stroke="#8fbc77"
                            strokeWidth={14}
                            strokeDasharray="90 50"
                        />
                        <circle
                            cx={tree.pos.x}
                            cy={tree.pos.y}
                            r={Math.max(55, Math.round(r * 0.12))}
                            fill="#684832"
                        />
                    </g>
                );
            })}
        </g>
    );
}
