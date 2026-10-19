import {
    SYMBOL_LINE as LINE,
    SYMBOL_LINE_SEC as LINE_SEC,
    SYMBOL_FILL as FILL,
    type Plan2dSymbolProps as BaseProps,
} from '../lib/plan2d-symbol-common';

export function Plan2dWasher({
    pos,
    size = 680,
}: BaseProps & { readonly size?: number }): React.JSX.Element {
    return (
        <g className="symbol-washer">
            <rect
                x={pos.x}
                y={pos.y}
                width={size}
                height={size}
                fill={FILL}
                stroke={LINE}
                strokeWidth={16}
            />
            <circle
                cx={pos.x + size / 2}
                cy={pos.y + size * 0.55}
                r={size * 0.28}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={16}
            />
        </g>
    );
}

export function Plan2dToilet({
    pos,
    width,
    height,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
}): React.JSX.Element {
    const midX = pos.x + width / 2;
    const tankW = Math.min(width, 700);

    return (
        <g className="symbol-toilet">
            <rect
                x={midX - tankW / 2}
                y={pos.y}
                width={tankW}
                height={240}
                rx={25}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <ellipse
                cx={midX}
                cy={pos.y + 240 + (height - 240) * 0.45}
                rx={Math.min(width * 0.32, 220)}
                ry={Math.min((height - 240) * 0.45, 300)}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <rect
                x={midX - 35}
                y={pos.y + 240}
                width={70}
                height={100}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={14}
            />
        </g>
    );
}
