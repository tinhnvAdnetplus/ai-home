export type RoomLabelItem = {
    readonly id: string;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly isVisible: boolean;
};

type Props = {
    readonly labels: readonly RoomLabelItem[];
    readonly isVisible: boolean;
};

export function RoomLabelsOverlay({
    labels,
    isVisible,
}: Props): React.JSX.Element | null {
    if (!isVisible || labels.length === 0) return null;

    return (
        <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-10"
        >
            {labels.map((item) => {
                if (!item.isVisible) return null;
                const boxW = Math.max(70, item.name.length * 12 + 16);
                return (
                    <g
                        key={item.id}
                        transform={`translate(${item.x.toString()}, ${item.y.toString()})`}
                    >
                        <rect
                            x={-boxW / 2}
                            y={-12}
                            width={boxW}
                            height={24}
                            rx={6}
                            fill="#ffffff"
                            fillOpacity={0.92}
                            stroke="#cbd5e1"
                            strokeWidth={1}
                        />
                        <text
                            x={0}
                            y={4}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight="bold"
                            fill="#1e293b"
                        >
                            {item.name}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
