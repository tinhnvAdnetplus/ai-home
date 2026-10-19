import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import type { AiUsageData } from '../types/admin-types';
import { AiUsageMetricCards } from './AiUsageMetricCards';
import { AiUsageChart } from './AiUsageChart';
import { AiDailyTotalsTable } from './AiDailyTotalsTable';
import { AiRecentCallsTable } from './AiRecentCallsTable';

type AiUsagePageProps = {
    readonly usageData: AiUsageData;
};

export function AiUsagePage({
    usageData,
}: AiUsagePageProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const { recentCalls, dailyTotals } = usageData;

    const totalCalls = dailyTotals.reduce((sum, d) => sum + d.totalCalls, 0);
    const totalTokens = dailyTotals.reduce(
        (sum, d) => sum + d.totalInputTokens + d.totalOutputTokens,
        0,
    );
    const totalDegraded = dailyTotals.reduce(
        (sum, d) => sum + d.degradedCalls,
        0,
    );
    const avgLatency =
        dailyTotals.length > 0
            ? Math.round(
                  dailyTotals.reduce((sum, d) => sum + d.avgLatencyMs, 0) /
                      dailyTotals.length,
              )
            : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {t('aiUsageTitle')}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {t('aiUsageSubtitle')}
                </p>
            </div>

            <AiUsageMetricCards
                totalCalls={totalCalls}
                totalTokens={totalTokens}
                totalDegraded={totalDegraded}
                avgLatency={avgLatency}
            />

            <Card className="border border-slate-200 bg-white shadow-xs p-5">
                <AiUsageChart dailyTotals={dailyTotals} />
            </Card>

            <AiDailyTotalsTable dailyTotals={dailyTotals} />

            <AiRecentCallsTable recentCalls={recentCalls} />
        </div>
    );
}
