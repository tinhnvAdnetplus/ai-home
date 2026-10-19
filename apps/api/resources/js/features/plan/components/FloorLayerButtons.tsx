import { useTranslation } from 'react-i18next';
import { Grid, Armchair, Ruler, Palette } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { type Plan2dOptions } from '../lib/plan2d-types';

type FloorLayerButtonsProps = {
    readonly options: Plan2dOptions;
    readonly onToggleGrid: () => void;
    readonly onToggleFixtures: () => void;
    readonly onToggleDimensions: () => void;
    readonly onToggleColor: () => void;
};

export function FloorLayerButtons({
    options,
    onToggleGrid,
    onToggleFixtures,
    onToggleDimensions,
    onToggleColor,
}: FloorLayerButtonsProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className={`h-11 w-11 min-w-[44px] min-h-[44px] sm:h-8 sm:w-8 sm:min-w-0 sm:min-h-0 p-0 rounded-full shadow-2xs ${options.isGridVisible ? 'bg-slate-200 text-[#0b6bdc] border-slate-300' : 'bg-white text-slate-500'}`}
                onClick={onToggleGrid}
                aria-label={t('plan:toggleGrid')}
                title={t('plan:toggleGrid')}
            >
                <Grid className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                className={`h-11 w-11 min-w-[44px] min-h-[44px] sm:h-8 sm:w-8 sm:min-w-0 sm:min-h-0 p-0 rounded-full shadow-2xs ${options.isFixturesVisible ? 'bg-slate-200 text-[#0b6bdc] border-slate-300' : 'bg-white text-slate-500'}`}
                onClick={onToggleFixtures}
                aria-label={t('plan:toggleFixtures')}
                title={t('plan:toggleFixtures')}
            >
                <Armchair className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                className={`h-11 w-11 min-w-[44px] min-h-[44px] sm:h-8 sm:w-8 sm:min-w-0 sm:min-h-0 p-0 rounded-full shadow-2xs ${options.isDimensionsVisible ? 'bg-slate-200 text-[#0b6bdc] border-slate-300' : 'bg-white text-slate-500'}`}
                onClick={onToggleDimensions}
                aria-label={t('plan:toggleDimensions')}
                title={t('plan:toggleDimensions')}
            >
                <Ruler className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
                variant="outline"
                size="sm"
                className={`h-11 w-11 min-w-[44px] min-h-[44px] sm:h-8 sm:w-8 sm:min-w-0 sm:min-h-0 p-0 rounded-full shadow-2xs ${options.isColorMode ? 'bg-slate-200 text-[#0b6bdc] border-slate-300' : 'bg-white text-slate-500'}`}
                onClick={onToggleColor}
                aria-label={t('plan:toggleColor')}
                title={t('plan:toggleColor')}
            >
                <Palette className="h-4 w-4" aria-hidden="true" />
            </Button>
        </>
    );
}
