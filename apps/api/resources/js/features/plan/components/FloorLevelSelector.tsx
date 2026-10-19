import { useTranslation } from 'react-i18next';

type FloorLevelSelectorProps = {
    readonly activeLevel: number;
    readonly maxLevel: number;
    readonly onSelectLevel: (level: number) => void;
};

export function FloorLevelSelector({
    activeLevel,
    maxLevel,
    onSelectLevel,
}: FloorLevelSelectorProps): React.JSX.Element {
    const { t } = useTranslation();

    if (maxLevel <= 1) {
        return (
            <span className="text-xs font-bold text-slate-700 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-2xs min-h-[44px] sm:min-h-0 flex items-center">
                {t('plan:floor1')}
            </span>
        );
    }

    return (
        <div className="inline-flex rounded-full bg-slate-200/80 p-0.5 shadow-2xs">
            <button
                type="button"
                onClick={() => {
                    onSelectLevel(1);
                }}
                className={
                    activeLevel === 1
                        ? 'min-h-[44px] sm:min-h-0 flex items-center rounded-full bg-[#0b6bdc] px-3 sm:px-3.5 py-1 text-xs font-bold text-white shadow-xs transition-all'
                        : 'min-h-[44px] sm:min-h-0 flex items-center rounded-full px-3 sm:px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all'
                }
            >
                {t('plan:floor1')}
            </button>
            <button
                type="button"
                onClick={() => {
                    onSelectLevel(2);
                }}
                className={
                    activeLevel === 2
                        ? 'min-h-[44px] sm:min-h-0 flex items-center rounded-full bg-[#0b6bdc] px-3 sm:px-3.5 py-1 text-xs font-bold text-white shadow-xs transition-all'
                        : 'min-h-[44px] sm:min-h-0 flex items-center rounded-full px-3 sm:px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all'
                }
            >
                {t('plan:floor2')}
            </button>
        </div>
    );
}
