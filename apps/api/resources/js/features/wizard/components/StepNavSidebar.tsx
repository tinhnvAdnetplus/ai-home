import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { type WizardConfig } from '@aihome/config-schema';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { resolveLocalized } from '../lib/field-helpers';
import {
    getHeroPhoto,
    getStepCaption,
    getStepHint,
    STEP_ICONS,
} from '../lib/step-nav-helpers';
import { StepNavRow } from './StepNavRow';

type StepNavSidebarProps = {
    readonly wizard: WizardConfig;
    readonly currentStepIndex: number;
    readonly onSelectStep: (stepIndex: number) => void;
};

export function StepNavSidebar({
    wizard,
    currentStepIndex,
    onSelectStep,
}: StepNavSidebarProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const heroPhoto = getHeroPhoto(currentStepIndex);
    const caption = getStepCaption(currentStepIndex, t);

    return (
        <aside className="relative hidden w-[300px] min-w-[300px] max-w-[300px] shrink-0 flex-col justify-between overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-full select-none">
            <img
                src={heroPhoto}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-bottom pointer-events-none"
            />
            <div className="absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-[#cae4f8]/85 via-[#e0eef8]/60 to-transparent pointer-events-none" />

            <div className="relative z-20 flex justify-end px-3 pt-2">
                <LanguageSwitcher />
            </div>

            <div className="relative z-10 px-4 pt-1 pb-3 flex items-center gap-2.5">
                <Home
                    className="h-[44px] w-[44px] shrink-0 text-[#0b6bdc] stroke-[2]"
                    aria-hidden="true"
                />
                <div className="leading-tight min-w-0">
                    <h2 className="text-[20px] font-black tracking-tight text-[#0c243c]">
                        {t('common:appName')}
                    </h2>
                    <p className="text-[12px] font-semibold text-slate-600 mt-0.5">
                        {t('wizard:sidebarSubtitle')}
                    </p>
                </div>
            </div>

            <nav
                aria-label={t('wizard:stepsNavLabel')}
                className="relative z-10 px-3 flex flex-col gap-2"
            >
                {wizard.steps.map((step, index) => (
                    <StepNavRow
                        key={step.key}
                        index={index}
                        stepKey={step.key}
                        isDone={index < currentStepIndex}
                        isCurrent={index === currentStepIndex}
                        isPink={index === 4 && index === currentStepIndex}
                        stepTitle={
                            index === 1
                                ? t('wizard:step2Progress')
                                : resolveLocalized(step.title, i18n.language)
                        }
                        stepHint={getStepHint(index, t)}
                        icon={STEP_ICONS[index] ?? Home}
                        onSelect={() => {
                            onSelectStep(index);
                        }}
                    />
                ))}
            </nav>

            <div className="relative z-10 mt-auto flex flex-col justify-end px-4 pb-8 pt-6 select-none">
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none -z-10" />
                <p className="max-w-[240px] whitespace-pre-line text-[21px] xl:text-[23px] font-bold italic leading-snug text-white drop-shadow-lg -rotate-[8deg] origin-bottom-left font-serif">
                    {caption}
                </p>
            </div>
        </aside>
    );
}
