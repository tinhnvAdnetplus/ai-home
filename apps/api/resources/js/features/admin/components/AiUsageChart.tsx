import { useTranslation } from 'react-i18next';
import type { AiDailyTotal } from '../types/admin-types';
import { AiUsageChartLegend } from './AiUsageChartLegend';
import { AiUsageChartBar } from './AiUsageChartBar';

type AiUsageChartProps = {
    readonly dailyTotals: readonly AiDailyTotal[];
};

function formatThousands(val: number): string {
    return `${Math.round(val).toString()}k`;
}

export function AiUsageChart({
    dailyTotals,
}: AiUsageChartProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    const dateMap = new Map<
        string,
        { totalTokens: number; totalCalls: number; degradedCalls: number }
    >();
    for (const row of dailyTotals) {
        const existing = dateMap.get(row.date) ?? {
            totalTokens: 0,
            totalCalls: 0,
            degradedCalls: 0,
        };
        existing.totalTokens += row.totalInputTokens + row.totalOutputTokens;
        existing.totalCalls += row.totalCalls;
        existing.degradedCalls += row.degradedCalls;
        dateMap.set(row.date, existing);
    }

    const dates = Array.from(dateMap.keys()).slice(0, 7).reverse();
    const dataPoints = dates.flatMap((d) => {
        const val = dateMap.get(d);
        if (!val) return [];
        return [{ date: d.slice(5), ...val }];
    });

    const maxTokens = Math.max(...dataPoints.map((d) => d.totalTokens), 1000);
    const chartHeight = 160;
    const barWidth = 36;
    const gap = 28;
    const svgWidth = Math.max(dates.length * (barWidth + gap) + 120, 680);
    const gridEndX = svgWidth - 20;

    return (
        <div className="space-y-3">
            <AiUsageChartLegend />
            <div className="w-full overflow-x-auto bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <svg
                    viewBox={`0 0 ${svgWidth.toString()} 200`}
                    className="w-full h-48 select-none"
                    aria-label={t('chartTitle')}
                >
                    <line
                        x1="40"
                        y1="20"
                        x2={gridEndX}
                        y2="20"
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                    />
                    <line
                        x1="40"
                        y1="90"
                        x2={gridEndX}
                        y2="90"
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                    />
                    <line
                        x1="40"
                        y1="160"
                        x2={gridEndX}
                        y2="160"
                        stroke="#cbd5e1"
                    />

                    <text
                        x="35"
                        y="24"
                        textAnchor="end"
                        fontSize="10"
                        fill="#94a3b8"
                    >
                        {formatThousands(maxTokens / 1000)}
                    </text>
                    <text
                        x="35"
                        y="94"
                        textAnchor="end"
                        fontSize="10"
                        fill="#94a3b8"
                    >
                        {formatThousands(maxTokens / 2000)}
                    </text>
                    <text
                        x="35"
                        y="164"
                        textAnchor="end"
                        fontSize="10"
                        fill="#94a3b8"
                    >
                        {t('chartZero', '0')}
                    </text>

                    {dataPoints.map((dp, i) => (
                        <AiUsageChartBar
                            key={dp.date}
                            date={dp.date}
                            totalTokens={dp.totalTokens}
                            degradedCalls={dp.degradedCalls}
                            x={55 + i * (barWidth + gap)}
                            barWidth={barWidth}
                            maxTokens={maxTokens}
                            chartHeight={chartHeight}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
