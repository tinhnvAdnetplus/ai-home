import { useTranslation } from 'react-i18next';
import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { type ImageTileProps } from './ImageTileTypes';
import { PlanTypeOtherSvg } from './PlanTypeOtherSvg';

type PlanTypeTileProps = ImageTileProps & {
    readonly photo?: string | null | undefined;
    readonly FallbackIcon: LucideIcon;
};

export function PlanTypeTile({
    option,
    isSelected,
    isDisabled,
    onPick,
    photo,
    FallbackIcon,
}: PlanTypeTileProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const isOther = option.value === 'other';

    return (
        <button
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => {
                onPick(option.value);
            }}
            className={cn(
                'group relative flex flex-col items-center justify-between rounded-xl border bg-white p-1.5 text-center transition-all cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                    ? 'border-2 border-primary shadow-xs'
                    : 'border-slate-200 hover:border-slate-300',
                isDisabled && 'pointer-events-none opacity-40',
            )}
        >
            {/* Radio circle in top-left */}
            {isSelected ? (
                <span className="absolute left-1.5 top-1.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                    <Check
                        className="h-2.5 w-2.5 stroke-[3]"
                        aria-hidden="true"
                    />
                </span>
            ) : (
                <span className="absolute left-1.5 top-1.5 z-10 h-3.5 w-3.5 rounded-full border border-slate-300 bg-white/90" />
            )}

            {/* Picture or house outline */}
            <div className="w-full h-[58px] xl:h-[62px] rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center mb-1 border border-slate-100">
                {isOther ? (
                    <PlanTypeOtherSvg />
                ) : photo ? (
                    <img
                        src={photo}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <FallbackIcon
                            className="h-7 w-7 stroke-[1.5]"
                            aria-hidden="true"
                        />
                    </div>
                )}
            </div>

            <span
                className={cn(
                    'text-[11px] xl:text-[11.5px] leading-tight text-center min-h-[28px] flex items-center justify-center w-full',
                    isSelected
                        ? 'font-bold text-primary'
                        : 'font-medium text-slate-700',
                )}
            >
                {isOther ? (
                    <span>
                        {t('wizard:planTypeOtherLine1')}
                        <br />
                        {t('wizard:planTypeOtherLine2')}
                    </span>
                ) : (
                    resolveLocalized(option.label, i18n.language)
                )}
            </span>
        </button>
    );
}
