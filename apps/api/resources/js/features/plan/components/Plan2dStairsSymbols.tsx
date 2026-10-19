import {
    SYMBOL_LINE as LINE,
    SYMBOL_LINE_SEC as LINE_SEC,
    SYMBOL_FILL as FILL,
    type Plan2dSymbolProps as BaseProps,
} from '../lib/plan2d-symbol-common';

export function Plan2dShoeBox({
    pos,
    width,
    depth,
}: BaseProps & {
    readonly width: number;
    readonly depth: number;
}): React.JSX.Element {
    return (
        <g className="symbol-shoebox">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={depth}
                fill={FILL}
                stroke={LINE}
                strokeWidth={16}
            />
            <line
                x1={pos.x + width * 0.33}
                y1={pos.y}
                x2={pos.x + width * 0.33}
                y2={pos.y + depth}
                stroke={LINE_SEC}
                strokeWidth={12}
            />
            <line
                x1={pos.x + width * 0.66}
                y1={pos.y}
                x2={pos.x + width * 0.66}
                y2={pos.y + depth}
                stroke={LINE_SEC}
                strokeWidth={12}
            />
        </g>
    );
}

export function Plan2dStairs({
    pos,
    width,
    height,
    upLabel,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
    readonly upLabel: string;
}): React.JSX.Element {
    // U-turn stair: open end at the top of the drawing, landing at the bottom
    const flightW = width / 2;
    const landingH = Math.min(flightW, height / 3);
    const runTop = pos.y;
    const runBottom = pos.y + height - landingH;
    const steps = 7;
    const lines: React.JSX.Element[] = [];
    for (let i = 1; i < steps; i++) {
        const y = runTop + ((runBottom - runTop) / steps) * i;
        lines.push(
            <line
                key={`stair-line-${i.toString()}`}
                x1={pos.x}
                y1={y}
                x2={pos.x + width}
                y2={y}
                stroke={LINE}
                strokeWidth={14}
            />,
        );
    }
    const leftX = pos.x + flightW / 2;
    const rightX = pos.x + flightW * 1.5;
    const turnY = pos.y + height - landingH / 2;
    return (
        <g className="symbol-stairs">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={height}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            {lines}
            <line
                x1={pos.x + flightW}
                y1={runTop}
                x2={pos.x + flightW}
                y2={runBottom}
                stroke={LINE}
                strokeWidth={20}
            />
            <line
                x1={pos.x}
                y1={runBottom}
                x2={pos.x + width}
                y2={runBottom}
                stroke={LINE}
                strokeWidth={20}
            />
            <path
                d={`M ${leftX.toString()} ${(runTop + 370).toString()} V ${turnY.toString()} H ${rightX.toString()} V ${(runTop + 210).toString()} m -80 140 l 80 -140 l 80 140`}
                fill="none"
                stroke="#16a34a"
                strokeWidth={24}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <text
                x={leftX}
                y={runTop + 230}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={165}
                fontWeight="bold"
                fill="#16a34a"
                stroke="#ffffff"
                strokeWidth={55}
                strokeLinejoin="round"
                paintOrder="stroke"
            >
                {upLabel}
            </text>
        </g>
    );
}
