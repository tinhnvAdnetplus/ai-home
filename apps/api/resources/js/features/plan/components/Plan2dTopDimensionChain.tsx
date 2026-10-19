import { type DimensionChain } from '../lib/plan2d-types';
import { GRID_MM } from '../lib/plan2d-colors';

type Plan2dTopDimensionChainProps = {
    readonly topChain: DimensionChain;
    readonly minY: number;
};

export function Plan2dTopDimensionChain({
    topChain,
    minY,
}: Plan2dTopDimensionChainProps): React.JSX.Element {
    return (
        <g className="plan2d-top-dimensions">
            <line
                x1={topChain.start}
                y1={topChain.offset}
                x2={topChain.end}
                y2={topChain.offset}
                stroke="#8a938c"
                strokeWidth={16}
            />
            {topChain.ticks.map((tk) => (
                <g key={`top-tk-${tk.pos.toString()}`}>
                    <path
                        d={`M ${(tk.pos - 60).toString()} ${(topChain.offset + 60).toString()} L ${(tk.pos + 60).toString()} ${(topChain.offset - 60).toString()}`}
                        stroke="#8a938c"
                        strokeWidth={16}
                        fill="none"
                    />
                    <line
                        x1={tk.pos}
                        y1={topChain.offset}
                        x2={tk.pos}
                        y2={minY - 120}
                        stroke="#d8ded9"
                        strokeWidth={12}
                    />
                    {tk.pos < topChain.end ? (
                        <text
                            x={tk.pos + GRID_MM / 2}
                            y={topChain.offset - 100}
                            textAnchor="middle"
                            fontSize={220}
                            fill="#8a938c"
                        >
                            {tk.label}
                        </text>
                    ) : null}
                </g>
            ))}

            <line
                x1={topChain.start}
                y1={topChain.offset - 500}
                x2={topChain.end}
                y2={topChain.offset - 500}
                stroke="#8a938c"
                strokeWidth={20}
            />
            <path
                d={`M ${(topChain.start - 70).toString()} ${(topChain.offset - 430).toString()} L ${(topChain.start + 70).toString()} ${(topChain.offset - 570).toString()}`}
                stroke="#8a938c"
                strokeWidth={20}
            />
            <path
                d={`M ${(topChain.end - 70).toString()} ${(topChain.offset - 430).toString()} L ${(topChain.end + 70).toString()} ${(topChain.offset - 570).toString()}`}
                stroke="#8a938c"
                strokeWidth={20}
            />
            <text
                x={(topChain.start + topChain.end) / 2}
                y={topChain.offset - 620}
                textAnchor="middle"
                fontSize={320}
                fontWeight="bold"
                fill="#2f3a34"
            >
                {topChain.totalLabel}
            </text>
        </g>
    );
}
