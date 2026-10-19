import { useTranslation } from 'react-i18next';
import {
    Home,
    LayoutGrid,
    MapPin,
    Image as LucideImage,
    Users,
} from 'lucide-react';
import { type Step } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../lib/field-helpers';
import { StepProgress } from './StepProgress';

type StepHeaderProps = {
    readonly steps: readonly Step[];
    readonly currentStepIndex: number;
    readonly onSelectStep: (stepIndex: number) => void;
};

const STEP_ICONS = [Home, MapPin, LayoutGrid, Users, LucideImage];

export function StepHeader({
    steps,
    currentStepIndex,
    onSelectStep,
}: StepHeaderProps): React.JSX.Element | null {
    const { t, i18n } = useTranslation();
    const step = steps[currentStepIndex];
    if (!step) {
        return null;
    }
    const Icon = STEP_ICONS[currentStepIndex] ?? Home;
    const isAccent = currentStepIndex >= 3;

    return (
        <div className="flex flex-row flex-nowrap items-start justify-between gap-4 mb-3 xl:mb-3.5">
            <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                <span
                    className={cn(
                        'flex h-12 w-12 sm:h-[66px] sm:w-[66px] shrink-0 items-center justify-center rounded-2xl text-white shadow-xs mt-0.5',
                        isAccent ? 'bg-[#ec3064]' : 'bg-[#0b6bdc]',
                    )}
                >
                    <Icon
                        className="h-6 w-6 sm:h-9 sm:w-9 stroke-[2]"
                        aria-hidden="true"
                    />
                </span>
                <div className="min-w-0">
                    <p
                        className={cn(
                            'text-sm sm:text-[24px] font-bold tracking-tight leading-none',
                            isAccent ? 'text-[#ec3064]' : 'text-[#0b6bdc]',
                        )}
                    >
                        {t('wizard:step', { current: currentStepIndex + 1 })}
                    </p>
                    <h1 className="mt-1 text-2xl sm:text-[36px] xl:text-[46px] font-extrabold leading-[1.1] text-[#0c243c] tracking-tight">
                        {resolveLocalized(step.title, i18n.language)}
                    </h1>
                    {step.subtitle ? (
                        <p className="mt-1 text-sm sm:text-[15px] xl:text-[17px] text-slate-500 font-normal leading-snug line-clamp-2">
                            {resolveLocalized(step.subtitle, i18n.language)}
                        </p>
                    ) : null}
                </div>
            </div>
            <div className="hidden lg:block shrink-0 pt-1">
                <StepProgress
                    steps={steps}
                    currentStepIndex={currentStepIndex}
                    onSelectStep={onSelectStep}
                />
            </div>
        </div>
    );
}
