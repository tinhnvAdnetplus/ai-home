import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type WizardConfig, type WizardState } from '@aihome/config-schema';
import { MobileHeader } from './MobileHeader';
import { StepSidebar } from './StepSidebar';
import { StepHeader } from './StepHeader';
import { SectionCard } from './SectionCard';
import { WizardFooter } from './WizardFooter';
import { Step3TipsPanel } from './Step3TipsPanel';
import { Step4TipsCard } from './Step4TipsCard';
import { Step5Layout } from './Step5Layout';
import { validateCurrentStep } from '../lib/wizard-validation';
import { useFitViewport } from '../lib/use-fit-viewport';

type WizardShellProps = {
    readonly wizard: WizardConfig;
    readonly currentStepIndex: number;
    readonly answers: Record<string, unknown>;
    readonly resolvedState: WizardState;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly onSelectStep: (stepIndex: number) => void;
    readonly onNext: () => void;
    readonly onPrev: () => void;
};

export function WizardShell({
    wizard,
    currentStepIndex,
    answers,
    resolvedState,
    onAnswerChange,
    onSelectStep,
    onNext,
    onPrev,
}: WizardShellProps): React.JSX.Element {
    const { t } = useTranslation();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const rootRef = useFitViewport<HTMLDivElement>();
    const currentStep = wizard.steps[currentStepIndex] ?? wizard.steps[0];

    const handleNextClick = (): void => {
        if (!currentStep) return;
        const validationErrors = validateCurrentStep(
            currentStep,
            answers,
            resolvedState,
            () => t('wizard:validationError'),
            (min: number, max: number) =>
                t('wizard:numberOutOfRange', {
                    min: min.toString(),
                    max: max.toString(),
                }),
        );

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const firstKey = Object.keys(validationErrors)[0];
            if (firstKey) {
                const el = document.getElementById(firstKey);
                el?.focus();
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setErrors({});
        onNext();
    };

    return (
        <div
            className="flex min-h-screen flex-col lg:min-h-0 bg-[#f0f4f9] text-foreground lg:flex-row lg:overflow-hidden"
            ref={rootRef}
        >
            <StepSidebar
                wizard={wizard}
                currentStepIndex={currentStepIndex}
                onSelectStep={onSelectStep}
            />

            <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden lg:overflow-y-auto">
                <MobileHeader
                    currentStepIndex={currentStepIndex}
                    totalSteps={wizard.steps.length}
                    steps={wizard.steps}
                    onSelectStep={onSelectStep}
                />

                <main className="flex w-full flex-1 flex-col p-2.5 sm:p-3 lg:p-3">
                    {currentStep ? (
                        <div className="flex flex-1 flex-col justify-between rounded-[24px] bg-white p-3.5 sm:p-5 xl:px-7 xl:py-4 shadow-sm border border-slate-200/80 min-h-0">
                            <StepHeader
                                steps={wizard.steps}
                                currentStepIndex={currentStepIndex}
                                onSelectStep={onSelectStep}
                            />
                            {currentStepIndex === 4 ? (
                                <Step5Layout
                                    sections={currentStep.sections}
                                    answers={answers}
                                    resolvedState={resolvedState}
                                    onAnswerChange={onAnswerChange}
                                    errors={errors}
                                />
                            ) : (
                                <div className="flex flex-col lg:flex-row gap-2 xl:gap-2.5 flex-1 min-h-0 my-1 pb-12 lg:pb-0">
                                    <div className="grid flex-1 grid-cols-1 gap-2 xl:gap-2.5 xl:grid-cols-12 content-start">
                                        {currentStep.sections.map((section) => (
                                            <SectionCard
                                                key={section.key}
                                                section={section}
                                                answers={answers}
                                                resolvedState={resolvedState}
                                                onAnswerChange={onAnswerChange}
                                                errors={errors}
                                            />
                                        ))}
                                        {currentStepIndex === 3 ? (
                                            <Step4TipsCard />
                                        ) : null}
                                    </div>
                                    {currentStepIndex === 2 ? (
                                        <Step3TipsPanel />
                                    ) : null}
                                </div>
                            )}
                            <WizardFooter
                                currentStepIndex={currentStepIndex}
                                totalSteps={wizard.steps.length}
                                onPrev={onPrev}
                                onNext={handleNextClick}
                            />
                        </div>
                    ) : null}
                </main>
            </div>
        </div>
    );
}
