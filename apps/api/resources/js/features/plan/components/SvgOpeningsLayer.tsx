import { type Wall, type Opening } from '@aihome/bdm';
import { computeOpeningRenderData } from '../lib/svg-elements';

type SvgOpeningsLayerProps = {
    readonly walls: readonly Wall[];
    readonly openings: readonly Opening[];
};

export function SvgOpeningsLayer({
    walls,
    openings,
}: SvgOpeningsLayerProps): React.JSX.Element {
    const wallMap = new Map<string, Wall>();
    for (const w of walls) {
        wallMap.set(w.id, w);
    }

    return (
        <g className="openings">
            {openings.map((op) => {
                const parentWall = wallMap.get(op.wallId);
                if (!parentWall) return null;
                const data = computeOpeningRenderData(op, parentWall);
                if (!data) return null;

                if (data.kind === 'window' || data.kind === 'largeWindow') {
                    return (
                        <g key={op.id} className="opening-window">
                            <line
                                x1={data.p0.x}
                                y1={data.p0.y}
                                x2={data.p1.x}
                                y2={data.p1.y}
                                stroke="#ffffff"
                                strokeWidth={160}
                            />
                            <line
                                x1={data.p0.x}
                                y1={data.p0.y}
                                x2={data.p1.x}
                                y2={data.p1.y}
                                stroke="#0284c7"
                                strokeWidth={50}
                            />
                        </g>
                    );
                }

                if (data.kind === 'door' || data.kind === 'entrance') {
                    return (
                        <g key={op.id} className="opening-door">
                            <line
                                x1={data.p0.x}
                                y1={data.p0.y}
                                x2={data.p1.x}
                                y2={data.p1.y}
                                stroke="#ffffff"
                                strokeWidth={120}
                            />
                            {data.arcPath ? (
                                <path
                                    d={data.arcPath}
                                    fill="none"
                                    stroke="#64748b"
                                    strokeWidth={30}
                                    strokeDasharray="60 40"
                                />
                            ) : null}
                            {data.leafP ? (
                                <line
                                    x1={data.p0.x}
                                    y1={data.p0.y}
                                    x2={data.leafP.x}
                                    y2={data.leafP.y}
                                    stroke="#0f172a"
                                    strokeWidth={60}
                                />
                            ) : null}
                        </g>
                    );
                }

                return null;
            })}
        </g>
    );
}
