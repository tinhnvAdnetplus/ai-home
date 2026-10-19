import { useTranslation } from 'react-i18next';
import { Box, RotateCcw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { type PlanViewMode } from './PlanViewSwitcher';

type PlanCtaBandProps = {
    readonly onEditAnswers?: (() => void) | undefined;
    readonly onModeChange?: ((mode: PlanViewMode) => void) | undefined;
};

export function PlanCtaBand({
    onEditAnswers,
    onModeChange,
}: PlanCtaBandProps): React.JSX.Element {
    const { t } = useTranslation();

    const handleView3dClick = (): void => {
        if (onModeChange) {
            onModeChange('3d');
        }
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="rounded-[28px] bg-gradient-to-br from-[#0b6bdc] to-[#084fa5] p-5 sm:p-8 text-white shadow-md w-full min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-xs">
                            <Box className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                            {t('plan:ctaTitle')}
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                        {t('plan:ctaSubtitle')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    {onEditAnswers ? (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onEditAnswers}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl text-xs sm:text-sm font-bold h-11 sm:h-12 px-4 shadow-none min-h-[44px]"
                        >
                            <RotateCcw
                                className="h-4 w-4 mr-1.5"
                                aria-hidden="true"
                            />
                            <span>{t('plan:ctaRestartAnswers')}</span>
                        </Button>
                    ) : null}

                    {onModeChange ? (
                        <Button
                            type="button"
                            onClick={handleView3dClick}
                            className="bg-white hover:bg-slate-100 text-[#0b6bdc] rounded-2xl text-xs sm:text-sm font-extrabold h-11 sm:h-12 px-5 shadow-sm min-h-[44px]"
                        >
                            <Box
                                className="h-4 w-4 mr-1.5"
                                aria-hidden="true"
                            />
                            <span>{t('plan:ctaFindBuilders')}</span>
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
