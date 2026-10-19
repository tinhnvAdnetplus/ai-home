import { useTranslation } from 'react-i18next';
import {
    ChevronRight,
    Home,
    Image as ImageIcon,
    LayoutGrid,
    MapPin,
    Users,
} from 'lucide-react';
import { type WizardConfig } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { resolveLocalized } from '../lib/field-helpers';
import houseUrl from '../assets/generated/hero-step1.jpg';
import { HeroPanel } from './HeroPanel';
import { StepNavSidebar } from './StepNavSidebar';

type StepSidebarProps = {
    readonly wizard: WizardConfig;
    readonly currentStepIndex: number;
    readonly onSelectStep: (stepIndex: number) => void;
};

const STEP_ICONS = [Home, MapPin, LayoutGrid, Users, ImageIcon];

export function StepSidebar({
    wizard,
    currentStepIndex,
    onSelectStep,
}: StepSidebarProps): React.JSX.Element {
    const { t, i18n } = useTranslation();

    if (currentStepIndex > 0) {
        return (
            <StepNavSidebar
                wizard={wizard}
                currentStepIndex={currentStepIndex}
                onSelectStep={onSelectStep}
            />
        );
    }

    return (
        <aside className="relative hidden w-[300px] min-w-[300px] max-w-[300px] shrink-0 flex-col overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-full select-none">
            <img
                src={houseUrl}
                alt=""
                className="pointer-events-none absolute inset-x-0 -top-[25%] h-[125%] w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[#cae4f8]/90 via-[#e0eef8]/60 to-transparent" />
            <div className="absolute right-3 top-3 z-20 opacity-80 hover:opacity-100">
                <LanguageSwitcher />
            </div>
            <HeroPanel />
            <div className="relative z-10 px-3 pb-2.5 pt-2">
                <p className="mb-2 text-center leading-tight rounded-xl bg-white/80 px-2 py-1.5">
                    <span className="text-[14px] font-bold text-slate-800">
                        {t('wizard:heroStepsA')}
                    </span>
                    <span className="text-[24px] font-black text-[#0c243c] mx-1.5 leading-none align-middle inline-block">
                        {wizard.steps.length}
                    </span>
                    <span className="text-[14px] font-bold text-slate-800">
                        {t('wizard:heroStepsB')}
                    </span>
                    <br />
                    <span className="text-[11px] font-bold text-slate-600 mt-0.5 inline-block">
                        {t('wizard:heroStepsC')}
                    </span>
                </p>
                <nav
                    aria-label={t('wizard:stepsNavLabel')}
                    className="flex flex-col gap-1.5"
                >
                    {wizard.steps.map((step, index) => {
                        const Icon = STEP_ICONS[index] ?? Home;
                        const isCurrent = index === currentStepIndex;
                        const stepTitle =
                            index === 1
                                ? t('wizard:step2Sidebar')
                                : resolveLocalized(step.title, i18n.language);

                        return (
                            <button
                                key={step.key}
                                type="button"
                                disabled={index > currentStepIndex}
                                aria-current={isCurrent ? 'step' : undefined}
                                onClick={() => {
                                    onSelectStep(index);
                                }}
                                className={cn(
                                    'flex h-[44px] items-center gap-3 rounded-2xl border px-3 text-left transition-all',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    isCurrent
                                        ? 'border-2 border-[#0b6bdc] bg-white shadow-xs'
                                        : 'border-transparent bg-white/80 hover:bg-white shadow-xs',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                                        isCurrent
                                            ? 'bg-[#0b6bdc] text-white shadow-xs'
                                            : 'bg-slate-200/80 text-slate-400',
                                    )}
                                >
                                    <Icon
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="flex min-w-0 flex-1 flex-col leading-none">
                                    <span
                                        className={cn(
                                            'text-[10px] font-extrabold tracking-wide leading-none',
                                            isCurrent
                                                ? 'text-[#0b6bdc]'
                                                : 'text-slate-400',
                                        )}
                                    >
                                        {t('wizard:step', {
                                            current: index + 1,
                                        })}
                                    </span>
                                    <span
                                        className={cn(
                                            'truncate text-[13px] font-bold leading-tight mt-0.5',
                                            isCurrent
                                                ? 'text-[#0c243c]'
                                                : 'text-slate-600',
                                        )}
                                    >
                                        {stepTitle}
                                    </span>
                                </span>
                                <ChevronRight
                                    className={cn(
                                        'h-4 w-4 shrink-0',
                                        isCurrent
                                            ? 'text-[#0b6bdc]'
                                            : 'text-slate-300',
                                    )}
                                    aria-hidden="true"
                                />
                            </button>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
