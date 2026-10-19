import {
    SYMBOL_LINE as LINE,
    SYMBOL_LINE_SEC as LINE_SEC,
    SYMBOL_FILL as FILL,
    type Plan2dSymbolProps as BaseProps,
} from '../lib/plan2d-symbol-common';

export function Plan2dDesk({
    pos,
    width,
    height,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
}): React.JSX.Element {
    const chairX = pos.x + width / 2;
    const chairY = pos.y + height + 240;

    return (
        <g className="symbol-desk">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={height}
                rx={20}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <rect
                x={pos.x + width * 0.22}
                y={pos.y + height * 0.16}
                width={width * 0.56}
                height={height * 0.28}
                rx={16}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
            <ellipse
                cx={chairX}
                cy={chairY}
                rx={240}
                ry={180}
                fill={FILL}
                stroke={LINE_SEC}
                strokeWidth={16}
            />
        </g>
    );
}

export function Plan2dWardrobe({
    pos,
    width,
    height,
}: BaseProps & {
    readonly width: number;
    readonly height: number;
}): React.JSX.Element {
    const midX = pos.x + width / 2;
    const doorLen = Math.min(width / 2 - 40, height);

    return (
        <g className="symbol-wardrobe">
            <rect
                x={pos.x}
                y={pos.y}
                width={width}
                height={height}
                fill={FILL}
                stroke={LINE}
                strokeWidth={22}
            />
            <line
                x1={midX}
                y1={pos.y}
                x2={midX}
                y2={pos.y + height}
                stroke={LINE_SEC}
                strokeWidth={14}
            />
            <line
                x1={pos.x + 40}
                y1={pos.y + height}
                x2={pos.x + 40 + doorLen * 0.5}
                y2={pos.y + height + doorLen * 0.86}
                stroke={LINE}
                strokeWidth={16}
            />
            <line
                x1={pos.x + width - 40}
                y1={pos.y + height}
                x2={pos.x + width - 40 - doorLen * 0.5}
                y2={pos.y + height + doorLen * 0.86}
                stroke={LINE}
                strokeWidth={16}
            />
        </g>
    );
}
