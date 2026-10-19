import {
    SYMBOL_LINE as LINE,
    SYMBOL_LINE_SEC as LINE_SEC,
    SYMBOL_FILL as FILL,
    type Plan2dSymbolProps as BaseProps,
} from '../lib/plan2d-symbol-common';

export function Plan2dSofa({
    pos,
    width,
    height,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
}): React.JSX.Element {
    const arm = 170;
    const back = 200;
    const seatW = (width - arm * 2) / 2;

    return (
        <g className="symbol-sofa">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={height}
                rx={40}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <line
                x1={pos.x}
                y1={pos.y + back}
                x2={pos.x + width}
                y2={pos.y + back}
                stroke={LINE}
                strokeWidth={16}
            />
            <line
                x1={pos.x + arm}
                y1={pos.y + back}
                x2={pos.x + arm}
                y2={pos.y + height}
                stroke={LINE}
                strokeWidth={16}
            />
            <line
                x1={pos.x + width - arm}
                y1={pos.y + back}
                x2={pos.x + width - arm}
                y2={pos.y + height}
                stroke={LINE}
                strokeWidth={16}
            />
            <rect
                x={pos.x + arm + 30}
                y={pos.y + back + 40}
                width={seatW - 60}
                height={height - back - 80}
                rx={25}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <rect
                x={pos.x + arm + seatW + 30}
                y={pos.y + back + 40}
                width={seatW - 60}
                height={height - back - 80}
                rx={25}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
        </g>
    );
}

export function Plan2dSofaL({
    pos,
    width,
    height,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
}): React.JSX.Element {
    const chaiseW = Math.min(900, width * 0.4);
    const arm = 170;
    const back = 200;
    const d = `M ${pos.x.toString()} ${pos.y.toString()} h ${width.toString()} v ${height.toString()} h ${(-(width - chaiseW)).toString()} v ${(height * 0.95).toString()} h ${(-chaiseW).toString()} Z`;

    return (
        <g className="symbol-sofa-l">
            <path
                d={d}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
                strokeLinejoin="round"
            />
            <line
                x1={pos.x + chaiseW}
                y1={pos.y + back}
                x2={pos.x + width}
                y2={pos.y + back}
                stroke={LINE}
                strokeWidth={16}
            />
            <line
                x1={pos.x + back}
                y1={pos.y + back}
                x2={pos.x + back}
                y2={pos.y + height * 1.9}
                stroke={LINE}
                strokeWidth={16}
            />
            <rect
                x={pos.x + chaiseW + 40}
                y={pos.y + back + 40}
                width={width - chaiseW - arm - 80}
                height={height - back - 80}
                rx={25}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
        </g>
    );
}
