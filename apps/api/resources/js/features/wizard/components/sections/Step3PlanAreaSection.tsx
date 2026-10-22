import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/shared/ui/Input';

type Step3PlanAreaSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

const TSUBO_TO_M2 = 3.305785;

export function Step3PlanAreaSection({
    answers,
    onAnswerChange,
    isDisabled = false,
    errors = {},
}: Step3PlanAreaSectionProps): React.JSX.Element {
    const { t } = useTranslation();
    const [currentUnit, setCurrentUnit] = useState<'坪' | 'm²'>('坪');

    const rawArea =
        typeof answers.plan_target_area === 'number'
            ? answers.plan_target_area
            : undefined;

    const displayValue =
        rawArea === undefined
            ? ''
            : currentUnit === 'm²'
              ? (Math.round(rawArea * TSUBO_TO_M2 * 10) / 10).toString()
              : rawArea.toString();

    const approxM2 =
        rawArea === undefined ? 0 : Math.round(rawArea * TSUBO_TO_M2);

    const handleInputChange = (raw: string): void => {
        if (raw === '') {
            // Clearing the field unsets the answer; 0 would be saved as an
            // out-of-range value and the API rejects the whole draft.
            onAnswerChange('plan_target_area', undefined);
            return;
        }
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) {
            return;
        }
        if (currentUnit === 'm²') {
            const inTsubo = Math.round((parsed / TSUBO_TO_M2) * 10) / 10;
            onAnswerChange('plan_target_area', inTsubo);
        } else {
            onAnswerChange('plan_target_area', parsed);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            {/* Left: Input + Unit select + approx m2 */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                    <Input
                        id="plan_target_area"
                        type="number"
                        value={displayValue}
                        onChange={(e) => {
                            handleInputChange(e.target.value);
                        }}
                        disabled={isDisabled}
                        min={15}
                        max={100}
                        step={1}
                        className="w-24 sm:w-28 h-11 min-h-[44px] sm:h-9 sm:min-h-0 text-[16px] sm:text-base font-semibold"
                        aria-invalid={
                            errors.plan_target_area ? true : undefined
                        }
                    />
                    <div className="relative shrink-0">
                        <select
                            value={currentUnit}
                            onChange={(e) => {
                                const newUnit =
                                    e.target.value === 'm²' ? 'm²' : '坪';
                                setCurrentUnit(newUnit);
                            }}
                            disabled={isDisabled}
                            className="h-11 min-h-[44px] sm:h-9 sm:min-h-0 rounded-lg border border-slate-300 bg-white pl-3 pr-7 text-[16px] sm:text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                        >
                            <option value="坪">{t('wizard:unitTsubo')}</option>
                            <option value="m²">{t('wizard:unitM2')}</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                </div>
                <span className="text-xs text-slate-500 pl-0.5">
                    {t('wizard:areaApproxM2', { m2: approxM2 })}
                </span>
                {errors.plan_target_area ? (
                    <p role="alert" className="text-xs text-destructive">
                        {errors.plan_target_area}
                    </p>
                ) : null}
            </div>

            {/* Right: 広さの目安 Table */}
            <div className="w-full sm:w-auto rounded-xl bg-sky-50/50 border border-sky-100/80 px-3 py-1.5 text-xs sm:text-[11px] text-slate-600 shrink-0">
                <div className="font-bold text-slate-700 mb-1 text-center">
                    {t('wizard:areaGuideTitle')}
                </div>
                <div className="grid grid-cols-2 gap-x-3.5 gap-y-0.5">
                    <span className="font-medium text-slate-700">
                        {t('wizard:areaGuideTsubo25')}
                    </span>
                    <span className="text-slate-500 text-right">
                        {t('wizard:areaGuideM2_82')}
                    </span>
                    <span className="font-medium text-slate-700">
                        {t('wizard:areaGuideTsubo30')}
                    </span>
                    <span className="text-slate-500 text-right">
                        {t('wizard:areaGuideM2_99')}
                    </span>
                    <span className="font-medium text-slate-700">
                        {t('wizard:areaGuideTsubo35')}
                    </span>
                    <span className="text-slate-500 text-right">
                        {t('wizard:areaGuideM2_116')}
                    </span>
                    <span className="font-medium text-slate-700">
                        {t('wizard:areaGuideTsubo40')}
                    </span>
                    <span className="text-slate-500 text-right">
                        {t('wizard:areaGuideM2_132')}
                    </span>
                </div>
            </div>
        </div>
    );
}
