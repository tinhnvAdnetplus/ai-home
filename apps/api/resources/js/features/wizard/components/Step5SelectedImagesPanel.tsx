import { useTranslation } from 'react-i18next';
import { Camera, X } from 'lucide-react';
import houseUrl from '../assets/generated/hero-house.jpg';
import livingUrl from '../assets/generated/hero-living.jpg';
import { getTilePhoto } from '../lib/tile-photos';

export function Step5SelectedImagesPanel(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <aside
            aria-label={t('wizard:step5SelectedTitle')}
            className="w-full lg:w-[200px] xl:w-[220px] shrink-0 flex flex-col text-foreground"
        >
            <div className="rounded-2xl border border-rose-200/90 bg-[#fffbfc] p-2.5 shadow-xs flex flex-col justify-between h-full gap-2">
                <div>
                    <header className="text-xs font-bold text-[#ec3064] mb-2">
                        {t('wizard:step5SelectedTitle')}
                    </header>

                    <div className="flex flex-col gap-2">
                        {/* Exterior preview */}
                        <div className="relative rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs">
                            <button
                                type="button"
                                aria-label={t('wizard:uploadRemove')}
                                className="absolute right-1 top-1 z-10 flex h-11 w-11 min-h-[44px] min-w-[44px] sm:h-5 sm:w-5 sm:min-h-0 sm:min-w-0 items-center justify-center p-0"
                            >
                                <span className="flex h-5 w-5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-slate-800/80 text-white hover:bg-slate-900 transition-colors shadow-2xs">
                                    <X className="h-2.5 w-2.5" />
                                </span>
                            </button>
                            <div className="aspect-[16/10] max-h-[70px] overflow-hidden rounded bg-slate-100 mb-1">
                                <img
                                    src={
                                        getTilePhoto(
                                            'step5-selected-exterior',
                                        ) ?? houseUrl
                                    }
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span className="inline-block rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs sm:text-[9px] font-bold text-slate-700 shadow-2xs">
                                {t('wizard:step5ExteriorLabel')}
                            </span>
                        </div>

                        {/* Interior preview */}
                        <div className="relative rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs">
                            <button
                                type="button"
                                aria-label={t('wizard:uploadRemove')}
                                className="absolute right-1 top-1 z-10 flex h-11 w-11 min-h-[44px] min-w-[44px] sm:h-5 sm:w-5 sm:min-h-0 sm:min-w-0 items-center justify-center p-0"
                            >
                                <span className="flex h-5 w-5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-slate-800/80 text-white hover:bg-slate-900 transition-colors shadow-2xs">
                                    <X className="h-2.5 w-2.5" />
                                </span>
                            </button>
                            <div className="aspect-[16/10] max-h-[70px] overflow-hidden rounded bg-slate-100 mb-1">
                                <img
                                    src={
                                        getTilePhoto(
                                            'step5-selected-interior',
                                        ) ?? livingUrl
                                    }
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span className="inline-block rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs sm:text-[9px] font-bold text-slate-700 shadow-2xs">
                                {t('wizard:step5InteriorLabel')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Add reference photos button */}
                <button
                    type="button"
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#ec3064] bg-white p-2 text-center text-[#ec3064] hover:bg-rose-50/70 transition-colors shadow-2xs"
                >
                    <Camera className="h-4 w-4 shrink-0 text-[#ec3064]" />
                    <div className="flex flex-col items-center justify-center leading-tight">
                        <span className="text-xs xl:text-[10.5px] font-bold">
                            {t('wizard:step5AddPhotosTitle')}
                        </span>
                        <span className="text-xs sm:text-[9px] font-medium">
                            {t('wizard:step5AddPhotosCount')}
                        </span>
                    </div>
                </button>
            </div>
        </aside>
    );
}
