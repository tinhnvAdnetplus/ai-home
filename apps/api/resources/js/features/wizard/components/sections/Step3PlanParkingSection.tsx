import { useTranslation } from 'react-i18next';
import { Car, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';
import { getTilePhoto } from '../../lib/tile-photos';
import {
    PARKING_COUNT_OPTIONS,
    PARKING_CHECKBOX_OPTIONS,
} from './Step3ParkingConfigs';

type Step3PlanParkingSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

export function Step3PlanParkingSection({
    answers,
    onAnswerChange,
    isDisabled = false,
}: Step3PlanParkingSectionProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const photo = getTilePhoto('parking-car');

    const rawCount = answers.plan_parking_count;
    const currentCount = typeof rawCount === 'string' ? rawCount : 'cars_2';

    const rawOptions = answers.plan_parking_options;
    const selectedOptions: readonly string[] = Array.isArray(rawOptions)
        ? rawOptions.filter((v): v is string => typeof v === 'string')
        : ['carport'];

    const isNone = currentCount === 'none';

    const handleCheckboxToggle = (val: string): void => {
        if (selectedOptions.includes(val)) {
            onAnswerChange(
                'plan_parking_options',
                selectedOptions.filter((v) => v !== val),
            );
        } else {
            onAnswerChange('plan_parking_options', [...selectedOptions, val]);
        }
    };

    return (
        <div className="flex items-center gap-3 w-full">
            {/* Left Photo */}
            <div className="w-24 sm:w-28 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                {photo ? (
                    <img
                        src={photo}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Car
                        className="w-8 h-8 text-slate-400 stroke-[1.5]"
                        aria-hidden="true"
                    />
                )}
            </div>

            {/* Right: Label + Select + 2 Checkboxes stacked */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 gap-1.5">
                {/* Count Select */}
                <div>
                    <label
                        htmlFor="plan_parking_count"
                        className="text-xs font-medium text-slate-500 block mb-0.5"
                    >
                        {t('wizard:carsCountLabel')}
                    </label>
                    <div className="relative w-full">
                        <select
                            id="plan_parking_count"
                            value={currentCount}
                            onChange={(e) => {
                                onAnswerChange(
                                    'plan_parking_count',
                                    e.target.value,
                                );
                            }}
                            disabled={isDisabled}
                            className="w-full h-11 min-h-[44px] sm:h-7.5 sm:min-h-0 rounded-lg border border-slate-300 bg-white pl-2.5 pr-7 text-[16px] sm:text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                        >
                            {PARKING_COUNT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {resolveLocalized(opt.label, i18n.language)}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                </div>

                {/* 2 Checkbox Rows */}
                <div className="flex flex-col gap-1">
                    {PARKING_CHECKBOX_OPTIONS.map((opt) => {
                        const isChecked = selectedOptions.includes(opt.value);

                        return (
                            <label
                                key={opt.value}
                                className={cn(
                                    'flex items-center gap-1.5 cursor-pointer select-none min-h-[32px] sm:min-h-0 py-0.5',
                                    (isDisabled || isNone) &&
                                        'opacity-40 pointer-events-none',
                                )}
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isChecked}
                                    disabled={isDisabled || isNone}
                                    onChange={() => {
                                        handleCheckboxToggle(opt.value);
                                    }}
                                />
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors shrink-0',
                                        isChecked
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'border-slate-300 bg-white',
                                    )}
                                >
                                    {isChecked ? (
                                        <Check
                                            className="w-2.5 h-2.5 stroke-[3]"
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                </span>
                                <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                                    {resolveLocalized(opt.label, i18n.language)}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
