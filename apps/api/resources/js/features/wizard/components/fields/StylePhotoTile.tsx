import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { type ImageTileProps } from './ImageTileTypes';

type StylePhotoTileProps = ImageTileProps & {
    readonly photo: string;
};

export function StylePhotoTile({
    option,
    isSelected,
    isDisabled,
    onPick,
    photo,
}: StylePhotoTileProps): React.JSX.Element {
    const { i18n } = useTranslation();

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
                'group relative flex flex-col rounded-xl overflow-hidden border-2 bg-white text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
                isSelected
                    ? 'border-primary shadow-xs'
                    : 'border-slate-200 hover:border-slate-300',
                isDisabled && 'pointer-events-none opacity-40',
            )}
        >
            <img
                src={photo}
                alt=""
                className="w-full object-cover h-[74px] xl:h-[82px]"
            />
            <div className="flex min-h-[30px] xl:h-[30px] w-full items-center justify-center bg-white px-1 py-0.5 border-t border-slate-100">
                <span
                    className={cn(
                        'text-xs xl:text-[12.5px] leading-tight text-center break-words tracking-tight w-full',
                        isSelected
                            ? 'font-bold text-primary'
                            : 'font-medium text-slate-700',
                    )}
                >
                    {resolveLocalized(option.label, i18n.language)}
                </span>
            </div>
        </button>
    );
}
