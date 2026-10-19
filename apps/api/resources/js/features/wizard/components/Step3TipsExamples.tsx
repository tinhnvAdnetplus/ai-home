import { useTranslation } from 'react-i18next';
import { House, ChevronRight } from 'lucide-react';
import livingUrl from '../assets/generated/hero-living.jpg';
import houseUrl from '../assets/generated/hero-house.jpg';
import { getTilePhoto } from '../lib/tile-photos';
import { Plan3LdkSvg } from './Step3TipsSamplePlanSvg';
import { PlanFlatSvg } from './Step3TipsPlanFlatSvg';

export function Step3TipsExamples(): React.JSX.Element {
    const { t } = useTranslation();

    const plan3ldk = getTilePhoto('ref-plan-3ldk');
    const house2story = getTilePhoto('ref-house-2story');
    const house1story = getTilePhoto('ref-house-1story');
    const planFlat = getTilePhoto('ref-plan-flat');

    return (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 xl:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-3 flex-1">
            <header className="text-xs xl:text-sm font-extrabold text-[#0c243c] leading-tight">
                {t('wizard:step3ExamplesTitle')}
            </header>

            <div className="flex flex-col gap-3">
                {/* Example 1: 3LDK 約30坪 2階建て */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2 flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-1.5 h-[96px] xl:h-[102px]">
                        <div className="h-full overflow-hidden rounded-lg bg-white flex items-center justify-center border border-slate-200/70">
                            {plan3ldk ? (
                                <img
                                    src={plan3ldk}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Plan3LdkSvg />
                            )}
                        </div>
                        <div className="h-full overflow-hidden rounded-lg bg-slate-200 flex items-center justify-center border border-slate-200/70">
                            <img
                                src={house2story ?? houseUrl}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 leading-tight">
                        <div>{t('wizard:step3Example1Ldk')}</div>
                        <div>{t('wizard:step3Example1Area')}</div>
                        <div>{t('wizard:step3Example1Stories')}</div>
                    </div>
                </div>

                {/* Example 2: 平屋 3LDK 約28坪 */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2 flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-1.5 h-[96px] xl:h-[102px]">
                        <div className="h-full overflow-hidden rounded-lg bg-slate-200 flex items-center justify-center border border-slate-200/70">
                            <img
                                src={house1story ?? livingUrl}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="h-full overflow-hidden rounded-lg bg-white flex items-center justify-center border border-slate-200/70">
                            {planFlat ? (
                                <img
                                    src={planFlat}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <PlanFlatSvg />
                            )}
                        </div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 leading-tight">
                        <div>{t('wizard:step3Example2Title')}</div>
                        <div>{t('wizard:step3Example2Area')}</div>
                    </div>
                </div>
            </div>

            {/* Bottom Button matching design card style */}
            <button
                type="button"
                className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-left hover:bg-slate-100 transition-colors cursor-pointer w-full"
            >
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                        <House className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold text-slate-800">
                            {t('wizard:step3MorePlansMain')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                            {t('wizard:step3MorePlansSub')}
                        </span>
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 text-primary shrink-0" />
            </button>
        </div>
    );
}
