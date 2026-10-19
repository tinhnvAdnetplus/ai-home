import { useTranslation } from 'react-i18next';
import { Brain, AlertCircle } from 'lucide-react';
import { type DesignConstraints } from '@aihome/planner';
import { Badge } from '@/shared/ui/Badge';
import { type AiSource } from '../types';
import { AiConstraintSections } from './AiConstraintSections';

type AiUnderstandingCardProps = {
    readonly constraints: DesignConstraints | undefined;
    readonly source: AiSource;
    readonly isDegraded: boolean;
};

export function AiUnderstandingCard({
    constraints,
    source,
    isDegraded,
}: AiUnderstandingCardProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="rounded-[24px] border border-blue-100 bg-linear-to-br from-blue-50/50 via-white to-indigo-50/30 p-4 sm:p-5 shadow-xs space-y-4 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-[#0b6bdc]">
                        <Brain className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900">
                            {t('ai:understandingTitle')}
                        </h2>
                        <span className="text-[11px] text-slate-500">
                            {t('ai:understandingSubtitle')}
                        </span>
                    </div>
                </div>

                {isDegraded && source !== 'local' ? (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="warning"
                            className="rounded-full text-[11px] px-2 py-0.5 flex items-center gap-1"
                        >
                            <AlertCircle
                                className="h-3 w-3"
                                aria-hidden="true"
                            />
                            {t('ai:degradedNotice')}
                        </Badge>
                    </div>
                ) : null}
            </div>

            {isDegraded || source === 'local' ? (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50/90 border border-amber-200/80 px-3 py-2 text-xs font-medium text-amber-900 shadow-2xs">
                    <AlertCircle
                        className="h-4 w-4 shrink-0 text-amber-600"
                        aria-hidden="true"
                    />
                    <span>{t('ai:constraintsFailedFallback')}</span>
                </div>
            ) : null}

            {constraints ? (
                <AiConstraintSections constraints={constraints} />
            ) : (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    {t('ai:fallbackExplanation')}
                </div>
            )}
        </div>
    );
}
