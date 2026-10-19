import { useTranslation } from 'react-i18next';
import { Edit2 } from 'lucide-react';
import { type Step, type WizardState } from '@aihome/config-schema';
import { Button } from '@/shared/ui/Button';
import { resolveLocalized } from '../lib/field-helpers';
import { formatAnswerValue } from '../lib/summary-helpers';

type SummaryStepCardProps = {
    readonly step: Step;
    readonly stepIndex: number;
    readonly answers: Record<string, unknown>;
    readonly resolvedState: WizardState;
    readonly onEdit: (stepIndex: number) => void;
};

export function SummaryStepCard({
    step,
    stepIndex,
    answers,
    resolvedState,
    onEdit,
}: SummaryStepCardProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const labels = {
        noAnswer: t('wizard:noAnswer'),
        yes: t('wizard:answerYes'),
        no: t('wizard:answerNo'),
    };
    const fields = step.sections.flatMap((s) =>
        s.fields.filter((f) => resolvedState.visible[f.key] ?? true),
    );

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {t('wizard:step', { current: stepIndex + 1 })}
                    </span>
                    <h2 className="text-base font-bold text-foreground">
                        {resolveLocalized(step.title, i18n.language)}
                    </h2>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        onEdit(stepIndex);
                    }}
                    className="h-8 gap-1 text-xs font-semibold text-primary"
                >
                    <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('wizard:edit')}</span>
                </Button>
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {fields.map((field) => (
                    <div
                        key={field.key}
                        className="flex flex-col gap-0.5 text-sm"
                    >
                        <dt className="text-xs font-medium text-muted-foreground">
                            {resolveLocalized(field.label, i18n.language)}
                        </dt>
                        <dd className="break-words text-sm font-semibold text-foreground">
                            {formatAnswerValue(
                                field,
                                answers[field.key],
                                i18n.language,
                                labels,
                            )}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
