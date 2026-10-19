import { useTranslation } from 'react-i18next';
import { ClipboardList, Edit3 } from 'lucide-react';
import { validatedDefaultWizard } from '@/features/wizard';
import { Button } from '@/shared/ui/Button';
import { PlanInputSummaryStepCard } from './PlanInputSummaryStepCard';

type PlanInputSummaryTabProps = {
    readonly answers?: Record<string, unknown> | undefined;
    readonly onEditAnswers?: (() => void) | undefined;
};

export function PlanInputSummaryTab({
    answers = {},
    onEditAnswers,
}: PlanInputSummaryTabProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const lang = i18n.language || 'ja';

    const memoText =
        typeof answers.memo === 'string'
            ? answers.memo
            : typeof answers.freeText === 'string'
              ? answers.freeText
              : '';

    return (
        <div className="space-y-6 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-[24px] border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                        <ClipboardList className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            {t('plan:inputSummaryTitle')}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {t('plan:inputSummarySubtitle')}
                        </p>
                    </div>
                </div>

                {onEditAnswers ? (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onEditAnswers}
                        className="rounded-xl flex items-center gap-1.5 text-xs h-9 font-semibold"
                    >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('plan:editAnswers')}</span>
                    </Button>
                ) : null}
            </div>

            <div className="space-y-4">
                {validatedDefaultWizard.steps.map((step) => (
                    <PlanInputSummaryStepCard
                        key={step.key}
                        step={step}
                        lang={lang}
                        answers={answers}
                    />
                ))}

                {memoText ? (
                    <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {t('plan:inputSummaryMemoTitle')}
                        </h3>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 border border-slate-100">
                            {memoText}
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
