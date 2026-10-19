import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

type WizardFooterProps = {
    readonly currentStepIndex: number;
    readonly totalSteps: number;
    readonly onPrev: () => void;
    readonly onNext: () => void;
    readonly isNextDisabled?: boolean | undefined;
};

export function WizardFooter({
    currentStepIndex,
    totalSteps,
    onPrev,
    onNext,
    isNextDisabled = false,
}: WizardFooterProps): React.JSX.Element {
    const { t } = useTranslation();

    const isLastStep = currentStepIndex === totalSteps - 1;
    const isAccent = currentStepIndex >= 3;
    const hasPrev = currentStepIndex > 0;

    return (
        <footer
            className={cn(
                'sticky bottom-0 z-30 mt-auto flex w-full items-center gap-2.5 sm:gap-4 border-t border-slate-200/90 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:static lg:border-t-0 lg:bg-transparent lg:p-0 lg:pt-3 lg:backdrop-blur-none',
                hasPrev ? 'justify-between' : 'justify-center',
            )}
        >
            {hasPrev ? (
                <>
                    <button
                        type="button"
                        onClick={onPrev}
                        className="inline-flex h-12 min-h-[44px] sm:h-[58px] w-[110px] sm:w-[235px] shrink-0 items-center justify-center gap-1.5 rounded-[16px] border border-slate-300 bg-white text-sm sm:text-[16px] font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <ChevronLeft
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            aria-hidden="true"
                        />
                        <span>{t('wizard:prevStep')}</span>
                    </button>
                    <Button
                        type="button"
                        size="lg"
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className={cn(
                            'h-12 min-h-[44px] sm:h-[58px] flex-1 rounded-full text-sm sm:text-[17px] font-bold shadow-md transition-all',
                            isAccent
                                ? 'bg-[#ec3064] text-white hover:bg-[#d82255]'
                                : 'bg-[#0b6bdc] text-white hover:bg-[#0958b5]',
                        )}
                    >
                        <span>
                            {isLastStep
                                ? t('wizard:submitPlan')
                                : t('wizard:nextStep')}
                        </span>
                        <ChevronRight
                            className="ml-2 h-5 w-5"
                            aria-hidden="true"
                        />
                    </Button>
                </>
            ) : (
                <div className="flex w-full justify-center">
                    <Button
                        type="button"
                        size="lg"
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className="h-12 min-h-[44px] sm:h-[54px] w-full max-w-[515px] rounded-full bg-[#0b6bdc] text-white hover:bg-[#0958b5] text-sm sm:text-[17px] font-bold shadow-md transition-all"
                    >
                        <span>{t('wizard:nextStep')}</span>
                        <ChevronRight
                            className="ml-2 h-5 w-5"
                            aria-hidden="true"
                        />
                    </Button>
                </div>
            )}
        </footer>
    );
}
