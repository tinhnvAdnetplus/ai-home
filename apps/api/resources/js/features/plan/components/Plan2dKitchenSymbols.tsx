import {
    SYMBOL_LINE as LINE,
    SYMBOL_LINE_SEC as LINE_SEC,
    SYMBOL_FILL as FILL,
    type Plan2dSymbolProps as BaseProps,
} from '../lib/plan2d-symbol-common';

export function Plan2dKitchen({
    pos,
    width,
    depth,
}: BaseProps & {
    readonly width: number;
    readonly depth: number;
}): React.JSX.Element {
    const sinkW = Math.min(760, width * 0.32);
    const sinkX = pos.x + width * 0.08;
    const stoveW = Math.min(720, width * 0.3);
    const stoveX = pos.x + width - stoveW - width * 0.06;

    return (
        <g className="symbol-kitchen">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={depth}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <rect
                x={sinkX}
                y={pos.y + depth * 0.16}
                width={sinkW}
                height={depth * 0.65}
                rx={35}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <circle
                cx={sinkX + sinkW / 2}
                cy={pos.y + depth * 0.12}
                r={45}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={14}
            />
            <rect
                x={stoveX}
                y={pos.y + depth * 0.16}
                width={stoveW}
                height={depth * 0.68}
                rx={25}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <circle
                cx={stoveX + stoveW * 0.3}
                cy={pos.y + depth * 0.35}
                r={80}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={14}
            />
            <circle
                cx={stoveX + stoveW * 0.7}
                cy={pos.y + depth * 0.35}
                r={80}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={14}
            />
            <circle
                cx={stoveX + stoveW * 0.3}
                cy={pos.y + depth * 0.65}
                r={80}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={14}
            />
            <circle
                cx={stoveX + stoveW * 0.7}
                cy={pos.y + depth * 0.65}
                r={80}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={14}
            />
        </g>
    );
}

export function Plan2dFridge({
    pos,
    size = 700,
}: BaseProps & { readonly size?: number }): React.JSX.Element {
    return (
        <g className="symbol-fridge">
            <rect
                x={pos.x}
                y={pos.y}
                width={size}
                height={size}
                fill={FILL}
                stroke={LINE}
                strokeWidth={16}
            />
            <line
                x1={pos.x}
                y1={pos.y + size * 0.38}
                x2={pos.x + size}
                y2={pos.y + size * 0.38}
                stroke={LINE_SEC}
                strokeWidth={12}
            />
        </g>
    );
}
