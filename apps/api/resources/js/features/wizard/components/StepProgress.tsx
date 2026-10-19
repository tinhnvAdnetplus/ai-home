import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { type Step } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../lib/field-helpers';

type StepProgressProps = {
    readonly steps: readonly Step[];
    readonly currentStepIndex: number;
    readonly onSelectStep?: ((stepIndex: number) => void) | undefined;
};

export function StepProgress({
    steps,
    currentStepIndex,
    onSelectStep,
}: StepProgressProps): React.JSX.Element {
    const { t, i18n } = useTranslation();

    return (
        <nav
            aria-label={t('wizard:progressNavLabel')}
            className="hidden items-start sm:flex select-none"
        >
            {steps.map((step, index) => {
                const isDone = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isAccent = currentStepIndex >= 3;
                const title = resolveLocalized(step.title, i18n.language);

                return (
                    <div
                        key={step.key}
                        className="relative flex w-[84px] xl:w-[94px] shrink-0 flex-col items-center"
                    >
                        {index > 0 ? (
                            <div
                                aria-hidden="true"
                                className={cn(
                                    'absolute right-1/2 top-[18px] -z-0 h-[2px] w-full',
                                    index <= currentStepIndex
                                        ? 'bg-[#0b6bdc]'
                                        : 'bg-slate-300',
                                )}
                            />
                        ) : null}
                        <button
                            type="button"
                            disabled={index > currentStepIndex}
                            aria-current={isCurrent ? 'step' : undefined}
                            onClick={() => {
                                onSelectStep?.(index);
                            }}
                            className="relative z-10 flex flex-col items-center focus-visible:outline-none cursor-pointer disabled:cursor-default"
                        >
                            <span
                                className={cn(
                                    'flex h-[36px] w-[36px] items-center justify-center rounded-full text-sm font-extrabold transition-colors',
                                    isDone
                                        ? 'bg-[#0b6bdc] text-white shadow-xs'
                                        : '',
                                    isCurrent
                                        ? isAccent
                                            ? 'bg-[#ec3064] text-white shadow-xs'
                                            : 'bg-[#0b6bdc] text-white shadow-xs'
                                        : '',
                                    !isDone && !isCurrent
                                        ? 'bg-[#cbd5e1] text-white'
                                        : '',
                                )}
                            >
                                {isDone ? (
                                    <Check
                                        className="h-4 w-4 stroke-[3]"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <span
                                className={cn(
                                    'mt-1.5 text-center text-[11px] xl:text-[12.5px] leading-[1.15] tracking-tight',
                                    i18n.language === 'ja'
                                        ? 'whitespace-nowrap text-[11px] xl:text-[12.5px]'
                                        : 'break-words text-[10px] xl:text-[11px] max-w-[84px] xl:max-w-[94px]',
                                    isCurrent
                                        ? isAccent
                                            ? 'font-bold text-[#ec3064]'
                                            : 'font-bold text-[#0b6bdc]'
                                        : 'font-medium text-slate-500',
                                )}
                            >
                                {title}
                            </span>
                        </button>
                    </div>
                );
            })}
        </nav>
    );
}
