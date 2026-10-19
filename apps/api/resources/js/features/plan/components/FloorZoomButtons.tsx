import { useTranslation } from 'react-i18next';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

type FloorZoomButtonsProps = {
    readonly onZoomIn?: (() => void) | undefined;
    readonly onZoomOut?: (() => void) | undefined;
    readonly isFullscreen?: boolean | undefined;
    readonly onToggleFullscreen?: (() => void) | undefined;
    readonly onResetZoom?: (() => void) | undefined;
};

export function FloorZoomButtons({
    onZoomIn,
    onZoomOut,
    isFullscreen = false,
    onToggleFullscreen,
    onResetZoom,
}: FloorZoomButtonsProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="h-11 w-11 min-w-[44px] min-h-[44px] sm:h-8 sm:w-8 sm:min-w-0 sm:min-h-0 p-0 rounded-full bg-white shadow-2xs hover:bg-slate-50"
                onClick={onZoomIn}
                aria-label={t('plan:zoomIn')}
                title={t('plan:zoomIn')}
            >
                <ZoomIn className="h-4 w-4 text-slate-700" aria-hidden="true" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="h-11 w-11 min-w-[44px] min-h-[44px] sm:h-8 sm:w-8 sm:min-w-0 sm:min-h-0 p-0 rounded-full bg-white shadow-2xs hover:bg-slate-50"
                onClick={onZoomOut}
                aria-label={t('plan:zoomOut')}
                title={t('plan:zoomOut')}
            >
                <ZoomOut
                    className="h-4 w-4 text-slate-700"
                    aria-hidden="true"
                />
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="h-11 w-11 min-w-[44px] min-h-[44px] sm:h-8 sm:w-8 sm:min-w-0 sm:min-h-0 p-0 rounded-full bg-white shadow-2xs hover:bg-slate-50"
                onClick={onToggleFullscreen ?? onResetZoom}
                aria-label={
                    isFullscreen
                        ? t('plan:exitFullscreen')
                        : t('plan:fullscreen')
                }
                title={
                    isFullscreen
                        ? t('plan:exitFullscreen')
                        : t('plan:fullscreen')
                }
            >
                {isFullscreen ? (
                    <Minimize2
                        className="h-4 w-4 text-slate-700"
                        aria-hidden="true"
                    />
                ) : (
                    <Maximize2
                        className="h-4 w-4 text-slate-700"
                        aria-hidden="true"
                    />
                )}
            </Button>
        </>
    );
}
