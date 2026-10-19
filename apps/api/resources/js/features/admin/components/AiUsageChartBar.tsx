type AiUsageChartBarProps = {
    readonly date: string;
    readonly totalTokens: number;
    readonly degradedCalls: number;
    readonly x: number;
    readonly barWidth: number;
    readonly maxTokens: number;
    readonly chartHeight: number;
};

export function AiUsageChartBar({
    date,
    totalTokens,
    degradedCalls,
    x,
    barWidth,
    maxTokens,
    chartHeight,
}: AiUsageChartBarProps): React.JSX.Element {
    const tokenHeight = Math.max((totalTokens / maxTokens) * chartHeight, 4);
    const y = 160 - tokenHeight;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={barWidth}
                height={tokenHeight}
                rx="4"
                fill={degradedCalls > 0 ? '#f59e0b' : '#3b82f6'}
            />
            <text
                x={x + barWidth / 2}
                y="180"
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
            >
                {date}
            </text>
            <text
                x={x + barWidth / 2}
                y={Math.max(y - 6, 14)}
                textAnchor="middle"
                fontSize="10"
                fill="#475569"
                fontWeight="bold"
            >
                {totalTokens > 1000
                    ? `${(totalTokens / 1000).toFixed(1)}k`
                    : totalTokens.toString()}
            </text>
        </g>
    );
}
