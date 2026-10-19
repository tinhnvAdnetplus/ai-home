import { type DimensionChain } from '../lib/plan2d-types';
import { GRID_MM } from '../lib/plan2d-colors';

type Plan2dLeftDimensionChainProps = {
    readonly leftChain: DimensionChain;
    readonly minX: number;
};

export function Plan2dLeftDimensionChain({
    leftChain,
    minX,
}: Plan2dLeftDimensionChainProps): React.JSX.Element {
    return (
        <g className="plan2d-left-dimensions">
            <line
                x1={leftChain.offset}
                y1={leftChain.start}
                x2={leftChain.offset}
                y2={leftChain.end}
                stroke="#8a938c"
                strokeWidth={16}
            />
            {leftChain.ticks.map((tk) => (
                <g key={`left-tk-${tk.pos.toString()}`}>
                    <path
                        d={`M ${(leftChain.offset + 60).toString()} ${(tk.pos - 60).toString()} L ${(leftChain.offset - 60).toString()} ${(tk.pos + 60).toString()}`}
                        stroke="#8a938c"
                        strokeWidth={16}
                        fill="none"
                    />
                    <line
                        x1={leftChain.offset}
                        y1={tk.pos}
                        x2={minX - 120}
                        y2={tk.pos}
                        stroke="#d8ded9"
                        strokeWidth={12}
                    />
                    {tk.pos < leftChain.end ? (
                        <text
                            x={leftChain.offset - 100}
                            y={tk.pos + GRID_MM / 2}
                            textAnchor="middle"
                            fontSize={220}
                            fill="#8a938c"
                            transform={`rotate(-90 ${(leftChain.offset - 100).toString()} ${(tk.pos + GRID_MM / 2).toString()})`}
                        >
                            {tk.label}
                        </text>
                    ) : null}
                </g>
            ))}

            <line
                x1={leftChain.offset - 500}
                y1={leftChain.start}
                x2={leftChain.offset - 500}
                y2={leftChain.end}
                stroke="#8a938c"
                strokeWidth={20}
            />
            <path
                d={`M ${(leftChain.offset - 430).toString()} ${(leftChain.start - 70).toString()} L ${(leftChain.offset - 570).toString()} ${(leftChain.start + 70).toString()}`}
                stroke="#8a938c"
                strokeWidth={20}
            />
            <path
                d={`M ${(leftChain.offset - 430).toString()} ${(leftChain.end - 70).toString()} L ${(leftChain.offset - 570).toString()} ${(leftChain.end + 70).toString()}`}
                stroke="#8a938c"
                strokeWidth={20}
            />
            <text
                x={leftChain.offset - 620}
                y={(leftChain.start + leftChain.end) / 2}
                textAnchor="middle"
                fontSize={320}
                fontWeight="bold"
                fill="#2f3a34"
                transform={`rotate(-90 ${(leftChain.offset - 620).toString()} ${((leftChain.start + leftChain.end) / 2).toString()})`}
            >
                {leftChain.totalLabel}
            </text>
        </g>
    );
}
