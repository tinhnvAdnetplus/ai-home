import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react';
import { type AnalysisStepId } from '../types';

type AiAnalysisScreenProps = {
    readonly currentStep: AnalysisStepId;
};

const STEP_ORDER = [
    { id: 'confirming', key: 'ai:stepConfirming' },
    { id: 'analyzing', key: 'ai:stepAnalyzing' },
    { id: 'reviewing', key: 'ai:stepReviewing' },
    { id: 'generating', key: 'ai:stepGenerating' },
    { id: 'rendering', key: 'ai:stepRendering' },
] as const;

function getStepStatus(
    stepId: AnalysisStepId,
    currentStep: AnalysisStepId,
): 'completed' | 'current' | 'upcoming' {
    const ids: readonly AnalysisStepId[] = [
        'confirming',
        'analyzing',
        'reviewing',
        'generating',
        'rendering',
    ];
    const currentIndex = ids.indexOf(currentStep);
    const targetIndex = ids.indexOf(stepId);

    if (targetIndex < currentIndex) return 'completed';
    if (targetIndex === currentIndex) return 'current';
    return 'upcoming';
}

export function AiAnalysisScreen({
    currentStep,
}: AiAnalysisScreenProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4 py-8"
            aria-live="polite"
            role="status"
        >
            <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-6">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0b6bdc]">
                    <Sparkles
                        className="h-8 w-8 animate-pulse"
                        aria-hidden="true"
                    />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#0b6bdc]" />
                    </span>
                </div>

                <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        {t('ai:analyzingTitle')}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        {t('ai:averageWaitTime')}
                    </p>
                </div>

                <div className="w-full rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                    {STEP_ORDER.map((item) => {
                        const status = getStepStatus(item.id, currentStep);
                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between text-xs sm:text-sm"
                            >
                                <span
                                    className={
                                        status === 'current'
                                            ? 'font-bold text-[#0b6bdc]'
                                            : status === 'completed'
                                              ? 'font-medium text-slate-700'
                                              : 'text-slate-400'
                                    }
                                >
                                    {t(item.key)}
                                </span>
                                <div className="flex items-center">
                                    {status === 'completed' ? (
                                        <CheckCircle2
                                            className="h-4 w-4 text-emerald-500"
                                            aria-hidden="true"
                                        />
                                    ) : status === 'current' ? (
                                        <Loader2
                                            className="h-4 w-4 text-[#0b6bdc] animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Circle
                                            className="h-4 w-4 text-slate-300"
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="text-xs text-slate-400">
                    {t('ai:analyzingNotice')}
                </p>
            </div>
        </div>
    );
}
