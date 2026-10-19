import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type Step2LandAreaSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

const TSUBO_TO_M2 = 3.305785;

export function Step2LandAreaSection({
    answers,
    onAnswerChange,
    isDisabled = false,
    errors = {},
}: Step2LandAreaSectionProps): React.JSX.Element {
    const { t } = useTranslation();
    const [currentUnit, setCurrentUnit] = useState<'坪' | 'm²'>('坪');

    const rawVal =
        typeof answers.land_area === 'number' ? answers.land_area : undefined;

    const displayValue =
        rawVal !== undefined
            ? currentUnit === 'm²'
                ? (Math.round(rawVal * TSUBO_TO_M2 * 10) / 10).toString()
                : rawVal.toString()
            : '';

    const handleInputChange = (raw: string): void => {
        if (raw === '') {
            onAnswerChange('land_area', 0);
            return;
        }
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) {
            return;
        }
        if (currentUnit === 'm²') {
            const inTsubo = Math.round((parsed / TSUBO_TO_M2) * 10) / 10;
            onAnswerChange('land_area', inTsubo);
        } else {
            onAnswerChange('land_area', parsed);
        }
    };

    return (
        <div className="w-full">
            <div
                className={cn(
                    'flex h-11 min-h-[44px] w-full items-center rounded-lg border border-slate-300 bg-white px-3 shadow-2xs transition-all',
                    'hover:border-slate-400 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
                    isDisabled && 'opacity-50 pointer-events-none',
                    errors.land_area &&
                        'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
                )}
            >
                <svg
                    viewBox="0 0 20 20"
                    className="h-5 w-5 shrink-0 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <rect x="2.5" y="2.5" width="15" height="15" rx="3.5" />
                    <line x1="10" y1="6.5" x2="10" y2="13.5" />
                    <line x1="6.5" y1="10" x2="13.5" y2="10" />
                </svg>

                <div className="mx-3 h-6 w-px shrink-0 bg-slate-200" />

                <input
                    id="land_area"
                    type="number"
                    value={displayValue}
                    onChange={(e) => {
                        handleInputChange(e.target.value);
                    }}
                    min={10}
                    max={500}
                    step={0.5}
                    disabled={isDisabled}
                    className="flex-1 bg-transparent p-0 text-[16px] sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-invalid={errors.land_area ? true : undefined}
                />

                <div className="mx-3 h-6 w-px shrink-0 bg-slate-200" />

                <div className="relative shrink-0 flex items-center pr-1 min-h-[44px]">
                    <select
                        value={currentUnit}
                        onChange={(e) => {
                            const newUnit =
                                e.target.value === 'm²' ? 'm²' : '坪';
                            setCurrentUnit(newUnit);
                        }}
                        disabled={isDisabled}
                        className="bg-transparent border-0 pr-5 text-[16px] sm:text-xs font-bold text-slate-700 outline-none cursor-pointer appearance-none min-h-[44px] flex items-center"
                    >
                        <option value="坪">{t('wizard:unitTsubo')}</option>
                        <option value="m²">{t('wizard:unitM2')}</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                </div>
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
                {t('wizard:landAreaExample')}
            </p>

            {errors.land_area ? (
                <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.land_area}
                </p>
            ) : null}
        </div>
    );
}
