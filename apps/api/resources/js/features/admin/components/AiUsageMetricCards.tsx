import { useTranslation } from 'react-i18next';
import { Sparkles, Activity, AlertTriangle, Clock } from 'lucide-react';
import { Card } from '@/shared/ui/Card';

type AiUsageMetricCardsProps = {
    readonly totalCalls: number;
    readonly totalTokens: number;
    readonly totalDegraded: number;
    readonly avgLatency: number;
};

function formatMs(ms: number): string {
    return `${ms.toString()} ms`;
}

export function AiUsageMetricCards({
    totalCalls,
    totalTokens,
    totalDegraded,
    avgLatency,
}: AiUsageMetricCardsProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200 bg-white shadow-xs p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs text-slate-500 font-medium">
                        {t('cardTotalCalls')}
                    </span>
                    <div className="text-xl font-bold text-slate-900">
                        {totalCalls.toLocaleString()}
                    </div>
                </div>
            </Card>
            <Card className="border border-slate-200 bg-white shadow-xs p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs text-slate-500 font-medium">
                        {t('cardTotalTokens')}
                    </span>
                    <div className="text-xl font-bold text-slate-900">
                        {totalTokens.toLocaleString()}
                    </div>
                </div>
            </Card>
            <Card className="border border-slate-200 bg-white shadow-xs p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs text-slate-500 font-medium">
                        {t('cardDegradedCalls')}
                    </span>
                    <div className="text-xl font-bold text-amber-700">
                        {totalDegraded.toLocaleString()}
                    </div>
                </div>
            </Card>
            <Card className="border border-slate-200 bg-white shadow-xs p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs text-slate-500 font-medium">
                        {t('cardAvgLatency')}
                    </span>
                    <div className="text-xl font-bold text-slate-900">
                        {formatMs(avgLatency)}
                    </div>
                </div>
            </Card>
        </div>
    );
}
