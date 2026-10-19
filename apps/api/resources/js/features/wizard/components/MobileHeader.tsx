import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { type Step } from '@aihome/config-schema';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../lib/field-helpers';
import houseUrl from '../assets/generated/hero-step1.jpg';

type MobileHeaderProps = {
    readonly currentStepIndex: number;
    readonly totalSteps: number;
    readonly steps: readonly Step[];
    readonly onSelectStep?: ((stepIndex: number) => void) | undefined;
};

export function MobileHeader({
    currentStepIndex,
    steps,
    onSelectStep,
}: MobileHeaderProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const currentStep = steps[currentStepIndex];
    const isAccent = currentStepIndex >= 3;
    const stepTitle = currentStep
        ? resolveLocalized(currentStep.title, i18n.language)
        : '';

    return (
        <div className="flex flex-col w-full lg:hidden select-none">
            {/* Step 1 Hero Photo Strip (120px banner with headline) */}
            {currentStepIndex === 0 ? (
                <div className="relative h-[120px] w-full overflow-hidden bg-slate-900">
                    <img
                        src={houseUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0c243c]/90 via-[#0c243c]/60 to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-center px-4 text-white">
                        <h2 className="text-[17px] font-black leading-tight tracking-tight drop-shadow-sm">
                            {t('wizard:heroTitle1')} {t('wizard:heroTitle2')}
                        </h2>
                        <p className="mt-1 text-[11px] font-medium leading-snug text-slate-200 line-clamp-2">
                            {t('wizard:overviewSubtitle')}
                        </p>
                    </div>
                </div>
            ) : null}

            {/* Sticky Compact Top Bar with Title + Flags + 5-dot Progress */}
            <header className="sticky top-0 z-30 flex flex-col border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-3 py-2 shadow-xs">
                {/* Row 1: Step title + Language flags */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span
                            className={cn(
                                'rounded px-1.5 py-0.5 text-[10px] font-black text-white shrink-0 leading-none',
                                isAccent ? 'bg-[#ec3064]' : 'bg-[#0b6bdc]',
                            )}
                        >
                            {t('wizard:step', {
                                current: currentStepIndex + 1,
                            })}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                            {stepTitle}
                        </span>
                    </div>
                    <div className="shrink-0 scale-90 origin-right">
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Row 2: Compact 5-dot/number progress */}
                <nav
                    aria-label={t('wizard:progressNavLabel')}
                    className="mt-1.5 flex items-center justify-between w-full max-w-[320px] mx-auto px-1"
                >
                    {steps.map((step, index) => {
                        const isDone = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <Fragment key={step.key}>
                                {index > 0 ? (
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'h-[2px] flex-1 mx-1 rounded-full transition-colors',
                                            index <= currentStepIndex
                                                ? isAccent
                                                    ? 'bg-[#ec3064]'
                                                    : 'bg-[#0b6bdc]'
                                                : 'bg-slate-200',
                                        )}
                                    />
                                ) : null}
                                <button
                                    type="button"
                                    disabled={index > currentStepIndex}
                                    aria-current={
                                        isCurrent ? 'step' : undefined
                                    }
                                    aria-label={t('wizard:step', {
                                        current: index + 1,
                                    })}
                                    onClick={() => onSelectStep?.(index)}
                                    className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center p-0"
                                >
                                    <span
                                        className={cn(
                                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-all',
                                            isDone
                                                ? 'bg-[#0b6bdc] text-white shadow-2xs'
                                                : isCurrent
                                                  ? isAccent
                                                      ? 'bg-[#ec3064] text-white ring-2 ring-[#ec3064]/30 ring-offset-1'
                                                      : 'bg-[#0b6bdc] text-white ring-2 ring-[#0b6bdc]/30 ring-offset-1'
                                                  : 'bg-slate-200 text-slate-400',
                                        )}
                                    >
                                        {isDone ? (
                                            <Check
                                                className="h-3 w-3 stroke-[3]"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            index + 1
                                        )}
                                    </span>
                                </button>
                            </Fragment>
                        );
                    })}
                </nav>
            </header>
        </div>
    );
}
