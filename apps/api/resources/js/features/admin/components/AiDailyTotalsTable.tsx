import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import type { AiDailyTotal } from '../types/admin-types';

type AiDailyTotalsTableProps = {
    readonly dailyTotals: readonly AiDailyTotal[];
};

function formatMs(ms: number): string {
    return `${ms.toString()} ms`;
}

export function AiDailyTotalsTable({
    dailyTotals,
}: AiDailyTotalsTableProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
            <CardHeader className="py-3 px-6 bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-700">
                    {t('dailyTotalsTitle')}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="py-2.5 px-6">{t('colDate')}</th>
                            <th className="py-2.5 px-6">{t('colProvider')}</th>
                            <th className="py-2.5 px-6">
                                {t('colTotalCalls')}
                            </th>
                            <th className="py-2.5 px-6">
                                {t('colInputTokens')}
                            </th>
                            <th className="py-2.5 px-6">
                                {t('colOutputTokens')}
                            </th>
                            <th className="py-2.5 px-6">{t('colLatency')}</th>
                            <th className="py-2.5 px-6">{t('colDegraded')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {dailyTotals.map((day) => (
                            <tr
                                key={`${day.date}-${day.provider}`}
                                className="hover:bg-slate-50"
                            >
                                <td className="py-2.5 px-6 font-medium text-slate-800">
                                    {day.date}
                                </td>
                                <td className="py-2.5 px-6 font-mono uppercase">
                                    {day.provider}
                                </td>
                                <td className="py-2.5 px-6">
                                    {day.totalCalls.toString()}
                                </td>
                                <td className="py-2.5 px-6 font-mono">
                                    {day.totalInputTokens.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-6 font-mono">
                                    {day.totalOutputTokens.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-6">
                                    {formatMs(day.avgLatencyMs)}
                                </td>
                                <td className="py-2.5 px-6">
                                    {day.degradedCalls > 0 ? (
                                        <Badge
                                            variant="warning"
                                            className="text-[10px]"
                                        >
                                            {day.degradedCalls.toString()}
                                        </Badge>
                                    ) : (
                                        <span className="text-slate-400">
                                            0
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
