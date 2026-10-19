import { type Wall } from '@aihome/bdm';
import { type OpeningRenderData } from '../lib/svg-elements';

type Plan2dDoorOpeningProps = {
    readonly opId: string;
    readonly wall: Wall;
    readonly data: OpeningRenderData;
    readonly nx: number;
    readonly ny: number;
};

export function Plan2dDoorOpening({
    opId,
    wall,
    data,
    nx,
    ny,
}: Plan2dDoorOpeningProps): React.JSX.Element {
    const isExterior = wall.kind === 'exterior';
    const strokeWidth = isExterior ? 180 : 130;

    if (data.kind === 'slidingDoor') {
        const midX = (data.p0.x + data.p1.x) / 2;
        const midY = (data.p0.y + data.p1.y) / 2;
        return (
            <g key={`door-${opId}`} className="opening-sliding">
                <line
                    x1={data.p0.x}
                    y1={data.p0.y}
                    x2={data.p1.x}
                    y2={data.p1.y}
                    stroke="#ffffff"
                    strokeWidth={strokeWidth}
                />
                <line
                    x1={data.p0.x + nx * 25}
                    y1={data.p0.y + ny * 25}
                    x2={midX + nx * 25}
                    y2={midY + ny * 25}
                    stroke="#3d4a43"
                    strokeWidth={28}
                />
                <line
                    x1={midX - nx * 25}
                    y1={midY - ny * 25}
                    x2={data.p1.x - nx * 25}
                    y2={data.p1.y - ny * 25}
                    stroke="#3d4a43"
                    strokeWidth={28}
                />
                <line
                    x1={data.p0.x - nx * 50}
                    y1={data.p0.y - ny * 50}
                    x2={data.p0.x + nx * 50}
                    y2={data.p0.y + ny * 50}
                    stroke="#6f7772"
                    strokeWidth={24}
                />
                <line
                    x1={data.p1.x - nx * 50}
                    y1={data.p1.y - ny * 50}
                    x2={data.p1.x + nx * 50}
                    y2={data.p1.y + ny * 50}
                    stroke="#6f7772"
                    strokeWidth={24}
                />
            </g>
        );
    }

    return (
        <g key={`door-${opId}`} className="opening-swing">
            <line
                x1={data.p0.x}
                y1={data.p0.y}
                x2={data.p1.x}
                y2={data.p1.y}
                stroke="#ffffff"
                strokeWidth={strokeWidth}
            />
            {data.arcPath ? (
                <path
                    d={data.arcPath}
                    fill="none"
                    stroke="#aeb6b0"
                    strokeWidth={18}
                />
            ) : null}
            {data.leafP ? (
                <line
                    x1={data.p0.x}
                    y1={data.p0.y}
                    x2={data.leafP.x}
                    y2={data.leafP.y}
                    stroke="#3d4a43"
                    strokeWidth={32}
                />
            ) : null}
            <line
                x1={data.p0.x - nx * 50}
                y1={data.p0.y - ny * 50}
                x2={data.p0.x + nx * 50}
                y2={data.p0.y + ny * 50}
                stroke="#6f7772"
                strokeWidth={24}
            />
            <line
                x1={data.p1.x - nx * 50}
                y1={data.p1.y - ny * 50}
                x2={data.p1.x + nx * 50}
                y2={data.p1.y + ny * 50}
                stroke="#6f7772"
                strokeWidth={24}
            />
        </g>
    );
}
