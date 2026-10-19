import { useState } from 'react';
import { type WizardConfig } from '@aihome/config-schema';
import { useWizardAnswers } from '../hooks/useWizardAnswers';
import { useWizardConfig } from '../hooks/use-wizard-config';
import { WizardShell } from './WizardShell';
import { WizardSummary } from './WizardSummary';

type WizardPageProps = {
    readonly onSubmit?:
        ((answers: Record<string, unknown>) => void) | undefined;
};

type WizardPageContentProps = {
    readonly wizard: WizardConfig;
    readonly onUserInteract: () => void;
    readonly onSubmit?:
        ((answers: Record<string, unknown>) => void) | undefined;
};

function WizardPageContent({
    wizard,
    onUserInteract,
    onSubmit,
}: WizardPageContentProps): React.JSX.Element {
    const {
        currentStepIndex,
        answers,
        resolvedState,
        setAnswer,
        goToStep,
        nextStep,
        prevStep,
    } = useWizardAnswers(wizard);

    const handleAnswerChange = (key: string, value: unknown): void => {
        onUserInteract();
        setAnswer(key, value);
    };

    const handleSelectStep = (stepIndex: number): void => {
        onUserInteract();
        goToStep(stepIndex);
    };

    const handleNext = (): void => {
        onUserInteract();
        if (onSubmit && currentStepIndex === wizard.steps.length - 1) {
            onSubmit(resolvedState.answers);
            return;
        }
        nextStep();
    };

    const handlePrev = (): void => {
        onUserInteract();
        prevStep();
    };

    const isSummaryStep = currentStepIndex >= wizard.steps.length;

    if (isSummaryStep) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <WizardSummary
                    wizard={wizard}
                    answers={answers}
                    resolvedState={resolvedState}
                    onEditStep={handleSelectStep}
                />
            </div>
        );
    }

    return (
        <WizardShell
            wizard={wizard}
            currentStepIndex={currentStepIndex}
            answers={answers}
            resolvedState={resolvedState}
            onAnswerChange={handleAnswerChange}
            onSelectStep={handleSelectStep}
            onNext={handleNext}
            onPrev={handlePrev}
        />
    );
}

export function WizardPage({ onSubmit }: WizardPageProps): React.JSX.Element {
    const [hasUserStarted, setHasUserStarted] = useState(false);
    const { wizard, configHash } = useWizardConfig({
        hasStartedAnswering: hasUserStarted,
    });

    const handleUserInteract = (): void => {
        setHasUserStarted(true);
    };

    return (
        <WizardPageContent
            key={configHash}
            wizard={wizard}
            onUserInteract={handleUserInteract}
            onSubmit={onSubmit}
        />
    );
}
