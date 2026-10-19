import {
    SYMBOL_LINE as LINE,
    SYMBOL_LINE_SEC as LINE_SEC,
    SYMBOL_FILL as FILL,
    type Plan2dSymbolProps as BaseProps,
} from '../lib/plan2d-symbol-common';

export function Plan2dBed({
    pos,
    width,
    height,
    isTwin,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
    readonly isTwin: boolean;
}): React.JSX.Element {
    const hb = 150;
    const dy = pos.y + hb + 470;
    const pillowW = isTwin ? width * 0.72 : width * 0.43;

    return (
        <g className="symbol-bed">
            <rect
                x={pos.x}
                y={pos.y + hb}
                width={width}
                height={height - hb}
                rx={30}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <rect
                x={pos.x + 20}
                y={pos.y}
                width={width - 40}
                height={hb}
                rx={25}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            {isTwin ? (
                <rect
                    x={pos.x + width * 0.14}
                    y={pos.y + hb + 70}
                    width={pillowW}
                    height={300}
                    rx={70}
                    fill={FILL}
                    stroke={LINE_SEC}
                    strokeWidth={16}
                />
            ) : (
                <>
                    <rect
                        x={pos.x + width * 0.05}
                        y={pos.y + hb + 70}
                        width={pillowW}
                        height={300}
                        rx={70}
                        fill={FILL}
                        stroke={LINE_SEC}
                        strokeWidth={16}
                    />
                    <rect
                        x={pos.x + width * 0.52}
                        y={pos.y + hb + 70}
                        width={pillowW}
                        height={300}
                        rx={70}
                        fill={FILL}
                        stroke={LINE_SEC}
                        strokeWidth={16}
                    />
                </>
            )}
            <line
                x1={pos.x}
                y1={dy}
                x2={pos.x + width}
                y2={dy}
                stroke={LINE}
                strokeWidth={16}
            />
            <path
                d={`M ${pos.x.toString()} ${dy.toString()} L ${(pos.x + width * 0.62).toString()} ${dy.toString()} L ${pos.x.toString()} ${(dy + (height - hb - 470) * 0.62).toString()} Z`}
                fill="none"
                stroke={LINE_SEC}
                strokeWidth={16}
            />
        </g>
    );
}

export function Plan2dNightstand({
    pos,
    size = 450,
}: BaseProps & { readonly size?: number }): React.JSX.Element {
    return (
        <rect
            x={pos.x}
            y={pos.y}
            width={size}
            height={size}
            rx={30}
            fill={FILL}
            stroke={LINE}
            strokeWidth={16}
        />
    );
}
