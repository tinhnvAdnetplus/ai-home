import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import type { AiCallMetric } from '../types/admin-types';

type AiRecentCallsTableProps = {
    readonly recentCalls: readonly AiCallMetric[];
};

function formatMs(ms: number): string {
    return `${ms.toString()} ms`;
}

export function AiRecentCallsTable({
    recentCalls,
}: AiRecentCallsTableProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <Card className="border border-slate-200 bg-white shadow-xs overflow-hidden">
            <CardHeader className="py-3 px-6 bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-700">
                    {t('recentCallsTitle')}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="py-2.5 px-6">{t('colTime')}</th>
                            <th className="py-2.5 px-6">{t('colProvider')}</th>
                            <th className="py-2.5 px-6">{t('colModel')}</th>
                            <th className="py-2.5 px-6">{t('colDegraded')}</th>
                            <th className="py-2.5 px-6">
                                {t('colInputTokens')}
                            </th>
                            <th className="py-2.5 px-6">
                                {t('colOutputTokens')}
                            </th>
                            <th className="py-2.5 px-6">{t('colLatency')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {recentCalls.map((call) => (
                            <tr key={call.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-6 text-slate-500">
                                    {call.createdAt
                                        ? new Date(
                                              call.createdAt,
                                          ).toLocaleTimeString()
                                        : '-'}
                                </td>
                                <td className="py-2.5 px-6 font-mono uppercase">
                                    {call.provider}
                                </td>
                                <td className="py-2.5 px-6 font-mono text-[11px] text-slate-600">
                                    {call.model}
                                </td>
                                <td className="py-2.5 px-6">
                                    <Badge
                                        variant={
                                            call.isDegraded
                                                ? 'warning'
                                                : 'outline'
                                        }
                                        className="text-[10px]"
                                    >
                                        {call.isDegraded
                                            ? t('degradedYes')
                                            : t('degradedNo')}
                                    </Badge>
                                </td>
                                <td className="py-2.5 px-6 font-mono">
                                    {call.inputTokens.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-6 font-mono">
                                    {call.outputTokens.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-6 text-slate-600">
                                    {formatMs(call.latencyMs)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
