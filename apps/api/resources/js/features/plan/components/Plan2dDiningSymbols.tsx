import {
    SYMBOL_LINE as LINE,
    SYMBOL_LINE_SEC as LINE_SEC,
    SYMBOL_FILL as FILL,
    type Plan2dSymbolProps as BaseProps,
} from '../lib/plan2d-symbol-common';

export function Plan2dLowTable({
    pos,
    width,
    height,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
}): React.JSX.Element {
    return (
        <rect
            x={pos.x}
            y={pos.y}
            width={width}
            height={height}
            rx={50}
            fill={FILL}
            stroke={LINE}
            strokeWidth={16}
        />
    );
}

export function Plan2dTvBoard({
    pos,
    width,
    height,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
}): React.JSX.Element {
    return (
        <g className="symbol-tvboard">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={height}
                rx={16}
                fill={FILL}
                stroke={LINE}
                strokeWidth={16}
            />
            <line
                x1={pos.x + width * 0.2}
                y1={pos.y + height * 0.35}
                x2={pos.x + width * 0.8}
                y2={pos.y + height * 0.35}
                stroke={LINE}
                strokeWidth={22}
            />
        </g>
    );
}

export function Plan2dDining({
    pos,
    radius = 550,
}: BaseProps & { readonly radius?: number }): React.JSX.Element {
    const chairSize = 380;
    const gap = radius + 120;

    return (
        <g className="symbol-dining">
            <rect
                x={pos.x - chairSize / 2}
                y={pos.y - gap - chairSize}
                width={chairSize}
                height={chairSize}
                rx={40}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <rect
                x={pos.x - chairSize / 2}
                y={pos.y + gap}
                width={chairSize}
                height={chairSize}
                rx={40}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <rect
                x={pos.x - gap - chairSize}
                y={pos.y - chairSize / 2}
                width={chairSize}
                height={chairSize}
                rx={40}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <rect
                x={pos.x + gap}
                y={pos.y - chairSize / 2}
                width={chairSize}
                height={chairSize}
                rx={40}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <circle
                cx={pos.x}
                cy={pos.y}
                r={radius * 0.45}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={16}
            />
        </g>
    );
}
