import { useTranslation } from 'react-i18next';
import { LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function GuestSaveBanner(): React.JSX.Element {
    const { t } = useTranslation();

    const handleLoginClick = (): void => {
        const returnPath = encodeURIComponent(
            window.location.hash || '#/wizard',
        );
        window.location.hash = `#/login?redirect=${returnPath}`;
    };

    return (
        <div
            role="status"
            className="w-full border-b border-blue-200 bg-blue-50/90 px-3 py-2 sm:px-6 shadow-xs backdrop-blur-xs overflow-hidden"
        >
            <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm w-full min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 text-blue-950 font-medium min-w-0 w-full sm:w-auto">
                    <Sparkles
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0b6bdc] shrink-0"
                        aria-hidden="true"
                    />
                    <span className="text-xs sm:text-sm leading-snug break-words">
                        {t('projects:guestBannerText')}
                    </span>
                </div>
                <Button
                    type="button"
                    size="sm"
                    onClick={handleLoginClick}
                    className="min-h-[32px] sm:min-h-[38px] rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white font-semibold text-xs px-3 shadow-xs shrink-0"
                >
                    <LogIn className="mr-1 h-3 w-3" aria-hidden="true" />
                    <span>{t('projects:guestBannerAction')}</span>
                </Button>
            </div>
        </div>
    );
}
