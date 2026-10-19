import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { getTilePhoto } from '../../lib/tile-photos';
import { STORAGE_TILES, getStorageLabelLines } from './Step3StorageConfigs';

type Step3PlanStorageSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

export function Step3PlanStorageSection({
    answers,
    onAnswerChange,
    isDisabled = false,
}: Step3PlanStorageSectionProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const rawStorage = answers.plan_storage;
    const selectedValues: readonly string[] = Array.isArray(rawStorage)
        ? rawStorage.filter((item): item is string => typeof item === 'string')
        : ['walkin_closet', 'pantry'];

    const handleToggle = (val: string): void => {
        if (selectedValues.includes(val)) {
            onAnswerChange(
                'plan_storage',
                selectedValues.filter((v) => v !== val),
            );
        } else {
            onAnswerChange('plan_storage', [...selectedValues, val]);
        }
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 w-full">
            {STORAGE_TILES.map((tile) => {
                const photo = getTilePhoto(tile.photoName);
                const FallbackIcon = tile.fallbackIcon;
                const isChecked = selectedValues.includes(tile.value);
                const lines = getStorageLabelLines(tile, i18n.language);

                return (
                    <button
                        key={tile.value}
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        disabled={isDisabled}
                        onClick={() => {
                            handleToggle(tile.value);
                        }}
                        className={cn(
                            'group relative flex flex-col items-center justify-between rounded-xl border bg-white p-1 text-center transition-all cursor-pointer',
                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                            isChecked
                                ? 'border-2 border-primary bg-sky-50/20 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40',
                            isDisabled && 'pointer-events-none opacity-40',
                        )}
                    >
                        {/* Photo or Fallback */}
                        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center mb-1 max-h-[52px] border border-slate-200/60">
                            {photo ? (
                                <img
                                    src={photo}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FallbackIcon
                                    className="w-5 h-5 text-slate-400 stroke-[1.5]"
                                    aria-hidden="true"
                                />
                            )}
                        </div>

                        {/* Checkbox + Label */}
                        <div className="flex items-center gap-1 w-full justify-center px-0.5 min-h-[28px]">
                            <span
                                className={cn(
                                    'w-3 h-3 rounded flex items-center justify-center border shrink-0',
                                    isChecked
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'border-slate-300 bg-white group-hover:border-slate-400',
                                )}
                            >
                                {isChecked ? (
                                    <Check
                                        className="w-2 h-2 stroke-[3]"
                                        aria-hidden="true"
                                    />
                                ) : null}
                            </span>
                            <span
                                className={cn(
                                    'text-[10px] xl:text-[10.5px] leading-tight text-left',
                                    isChecked
                                        ? 'font-bold text-slate-900'
                                        : 'font-medium text-slate-700',
                                )}
                            >
                                {lines.map((line) => (
                                    <span
                                        key={line}
                                        className="block whitespace-nowrap"
                                    >
                                        {line}
                                    </span>
                                ))}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
