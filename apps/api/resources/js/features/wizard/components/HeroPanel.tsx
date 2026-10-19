import { useTranslation } from 'react-i18next';
import livingUrl from '../assets/generated/hero-living.jpg';
import kitchenUrl from '../assets/generated/hero-kitchen.jpg';

/** Headline + interior photo card of the Step 1 left column (drawn over the house photo background). */
export function HeroPanel(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="relative z-10 flex flex-1 flex-col">
            <div className="px-4 pt-11">
                <h2 className="text-[32px] xl:text-[34px] font-black leading-[1.12] tracking-tight text-[#0c243c]">
                    {t('wizard:heroTitle1')}
                    <br />
                    {t('wizard:heroTitle2')}
                </h2>
                <p className="mt-2.5 whitespace-pre-line text-[13px] xl:text-[13.5px] font-medium leading-relaxed text-slate-600">
                    {t('wizard:heroSubtitle')}
                </p>
            </div>
            <div className="mt-auto mx-3 grid h-[92px] shrink-0 grid-cols-2 gap-2 rounded-2xl bg-white/95 p-2 shadow-md">
                <img
                    src={livingUrl}
                    alt=""
                    className="h-full min-h-0 w-full rounded-xl object-cover"
                />
                <img
                    src={kitchenUrl}
                    alt=""
                    className="h-full min-h-0 w-full rounded-xl object-cover"
                />
            </div>
        </div>
    );
}
