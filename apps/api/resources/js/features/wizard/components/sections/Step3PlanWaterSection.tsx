import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { getTilePhoto } from '../../lib/tile-photos';
import { WATER_COLUMNS } from './Step3WaterConfigs';

type Step3PlanWaterSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

export function Step3PlanWaterSection({
    answers,
    onAnswerChange,
    isDisabled = false,
}: Step3PlanWaterSectionProps): React.JSX.Element {
    const { i18n } = useTranslation();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
            {WATER_COLUMNS.map((col) => {
                const photo = getTilePhoto(col.photoName);
                const FallbackIcon = col.fallbackIcon;
                const rawValue = answers[col.fieldKey];
                const currentValue =
                    typeof rawValue === 'string'
                        ? rawValue
                        : col.options[0]?.value;

                return (
                    <div
                        key={col.id}
                        className="flex gap-2 rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                        {/* Left Photo */}
                        <div className="w-12 sm:w-[50px] h-[104px] rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                            {photo ? (
                                <img
                                    src={photo}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FallbackIcon
                                    className="w-6 h-6 text-slate-400 stroke-[1.5]"
                                    aria-hidden="true"
                                />
                            )}
                        </div>

                        {/* Right Title + 4 Checkbox Rows */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <h3 className="text-xs font-bold text-slate-800 mb-1">
                                {resolveLocalized(col.title, i18n.language)}
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                {col.options.map((opt) => {
                                    const isSelected =
                                        currentValue === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={isSelected}
                                            disabled={isDisabled}
                                            onClick={() => {
                                                onAnswerChange(
                                                    col.fieldKey,
                                                    opt.value,
                                                );
                                            }}
                                            className="flex items-center gap-1.5 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded min-h-[32px] sm:min-h-0 py-0.5"
                                        >
                                            <span
                                                className={cn(
                                                    'w-3.5 h-3.5 rounded flex items-center justify-center transition-colors border shrink-0',
                                                    isSelected
                                                        ? 'bg-primary border-primary text-primary-foreground shadow-2xs'
                                                        : 'border-slate-300 bg-white group-hover:border-slate-400',
                                                )}
                                            >
                                                {isSelected ? (
                                                    <Check
                                                        className="w-2.5 h-2.5 stroke-[3]"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-xs xl:text-[10.5px] leading-tight break-words',
                                                    isSelected
                                                        ? 'font-bold text-slate-900'
                                                        : 'text-slate-600 group-hover:text-slate-900',
                                                )}
                                            >
                                                {resolveLocalized(
                                                    opt.label,
                                                    i18n.language,
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
