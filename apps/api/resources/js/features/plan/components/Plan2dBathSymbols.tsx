import {
    SYMBOL_LINE as LINE,
    SYMBOL_LINE_SEC as LINE_SEC,
    SYMBOL_FILL as FILL,
    type Plan2dSymbolProps as BaseProps,
} from '../lib/plan2d-symbol-common';

export function Plan2dBathtub({
    pos,
    width,
    height,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
}): React.JSX.Element {
    const rim = 80;
    const drainX = width >= height ? pos.x + 220 : pos.x + width / 2;
    const drainY = width >= height ? pos.y + height / 2 : pos.y + height - 220;

    return (
        <g className="symbol-bathtub">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={height}
                rx={100}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <rect
                x={pos.x + rim}
                y={pos.y + rim}
                width={Math.max(100, width - rim * 2)}
                height={Math.max(100, height - rim * 2)}
                rx={70}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={14}
            />
            <circle
                cx={drainX}
                cy={drainY}
                r={55}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={14}
            />
        </g>
    );
}

export function Plan2dVanity({
    pos,
    width,
    depth,
}: BaseProps & {
    readonly width: number;
    readonly depth: number;
}): React.JSX.Element {
    const midX = pos.x + width / 2;
    return (
        <g className="symbol-vanity">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={depth}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <ellipse
                cx={midX}
                cy={pos.y + depth * 0.55}
                rx={Math.min(width * 0.32, 280)}
                ry={depth * 0.28}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <circle
                cx={midX}
                cy={pos.y + depth * 0.2}
                r={45}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={14}
            />
        </g>
    );
}
