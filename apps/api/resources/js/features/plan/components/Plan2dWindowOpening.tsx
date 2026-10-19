import { type Wall } from '@aihome/bdm';
import { type OpeningRenderData } from '../lib/svg-elements';

type Plan2dWindowOpeningProps = {
    readonly opId: string;
    readonly wall: Wall;
    readonly data: OpeningRenderData;
    readonly nx: number;
    readonly ny: number;
};

export function Plan2dWindowOpening({
    opId,
    wall,
    data,
    nx,
    ny,
}: Plan2dWindowOpeningProps): React.JSX.Element {
    const isBig = data.kind === 'largeWindow';
    const offsets = isBig ? [-35, 0, 35] : [-30, 30];

    return (
        <g key={`win-${opId}`} className="opening-window">
            <line
                x1={data.p0.x}
                y1={data.p0.y}
                x2={data.p1.x}
                y2={data.p1.y}
                stroke="#ffffff"
                strokeWidth={wall.kind === 'exterior' ? 180 : 130}
            />
            {offsets.map((off) => (
                <line
                    key={`win-line-${opId}-${off.toString()}`}
                    x1={data.p0.x + nx * off}
                    y1={data.p0.y + ny * off}
                    x2={data.p1.x + nx * off}
                    y2={data.p1.y + ny * off}
                    stroke="#5f6b64"
                    strokeWidth={20}
                />
            ))}
            <line
                x1={data.p0.x - nx * 60}
                y1={data.p0.y - ny * 60}
                x2={data.p0.x + nx * 60}
                y2={data.p0.y + ny * 60}
                stroke="#6f7772"
                strokeWidth={24}
            />
            <line
                x1={data.p1.x - nx * 60}
                y1={data.p1.y - ny * 60}
                x2={data.p1.x + nx * 60}
                y2={data.p1.y + ny * 60}
                stroke="#6f7772"
                strokeWidth={24}
            />
        </g>
    );
}
