import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Sparkles } from 'lucide-react';
import { type WizardConfig, type WizardState } from '@aihome/config-schema';
import { Button } from '@/shared/ui/Button';
import { SummaryStepCard } from './SummaryStepCard';

type WizardSummaryProps = {
    readonly wizard: WizardConfig;
    readonly answers: Record<string, unknown>;
    readonly resolvedState: WizardState;
    readonly onEditStep: (stepIndex: number) => void;
};

export function WizardSummary({
    wizard,
    answers,
    resolvedState,
    onEditStep,
}: WizardSummaryProps): React.JSX.Element {
    const { t } = useTranslation();
    const [isCopied, setIsCopied] = useState(false);
    const [hasPlanClicked, setHasPlanClicked] = useState(false);

    const handleCopyJson = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(
                JSON.stringify(resolvedState.answers, null, 2),
            );
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch {
            // Ignore clipboard errors
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6 pb-20">
            <header className="text-center flex flex-col gap-2">
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-primary text-xs font-bold mx-auto border border-brand-200 dark:border-brand-800">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>{t('wizard:summaryTitle')}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {t('wizard:summaryTitle')}
                </h1>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    {t('wizard:summarySubtitle')}
                </p>
            </header>

            <div className="flex flex-col gap-5">
                {wizard.steps.map((step, stepIndex) => (
                    <SummaryStepCard
                        key={step.key}
                        step={step}
                        stepIndex={stepIndex}
                        answers={answers}
                        resolvedState={resolvedState}
                        onEdit={onEditStep}
                    />
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        void handleCopyJson();
                    }}
                    className="w-full sm:w-auto h-12 px-6 rounded-xl font-medium gap-2"
                >
                    {isCopied ? (
                        <Check
                            className="w-4 h-4 text-success"
                            aria-hidden="true"
                        />
                    ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>
                        {isCopied ? t('wizard:copied') : t('wizard:copyJson')}
                    </span>
                </Button>

                <Button
                    type="button"
                    onClick={() => {
                        setHasPlanClicked(true);
                    }}
                    className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold bg-accent text-accent-foreground hover:bg-accent-600 shadow-md gap-2"
                >
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                    <span>{t('wizard:submitPlan')}</span>
                </Button>
            </div>

            {hasPlanClicked ? (
                <div
                    role="alert"
                    className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-center text-sm font-medium text-primary"
                >
                    {t('wizard:generatingPlanNotice')}
                </div>
            ) : null}
        </div>
    );
}
