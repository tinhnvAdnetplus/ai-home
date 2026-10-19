import { useTranslation } from 'react-i18next';

export function AiUsageChartLegend(): React.JSX.Element {
    const { t } = useTranslation('admin');
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
                {t('chartTitle')}
            </span>
            <div className="flex items-center gap-4 text-slate-500">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-blue-500 rounded-xs inline-block" />
                    <span>{t('cardTotalTokens')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block" />
                    <span>{t('cardDegradedCalls')}</span>
                </div>
            </div>
        </div>
    );
}
