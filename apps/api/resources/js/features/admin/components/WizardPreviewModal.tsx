import { useTranslation } from 'react-i18next';
import { X, Sparkles } from 'lucide-react';
import type { WizardConfig } from '@aihome/config-schema';
import { WizardShell, useWizardAnswers } from '@/features/wizard';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

type WizardPreviewModalProps = {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly draftConfig: WizardConfig | null;
};

function PreviewContent({
    wizard,
}: {
    readonly wizard: WizardConfig;
}): React.JSX.Element {
    const {
        currentStepIndex,
        answers,
        resolvedState,
        setAnswer,
        goToStep,
        nextStep,
        prevStep,
    } = useWizardAnswers(wizard);

    return (
        <div className="flex-1 overflow-y-auto">
            <WizardShell
                wizard={wizard}
                currentStepIndex={currentStepIndex}
                answers={answers}
                resolvedState={resolvedState}
                onAnswerChange={setAnswer}
                onSelectStep={goToStep}
                onNext={nextStep}
                onPrev={prevStep}
            />
        </div>
    );
}

export function WizardPreviewModal({
    isOpen,
    onClose,
    draftConfig,
}: WizardPreviewModalProps): React.JSX.Element | null {
    const { t } = useTranslation('admin');

    if (!isOpen || !draftConfig) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-xs">
            {/* Top Bar */}
            <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm">
                        {t('previewModalTitle')}
                    </span>
                    <Badge variant="warning" className="text-xs">
                        {t('previewModalNotice')}
                    </Badge>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                    className="text-slate-300 hover:text-white hover:bg-slate-800"
                    aria-label={t('close')}
                >
                    <X className="w-4 h-4 mr-1" />
                    {t('close')}
                </Button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden bg-[#f0f4f9] flex flex-col">
                <PreviewContent wizard={draftConfig} />
            </div>
        </div>
    );
}
