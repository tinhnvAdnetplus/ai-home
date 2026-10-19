import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/lib/cn';
import { resolveLocalized } from '../../lib/field-helpers';

type Step2SurroundingsSectionProps = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

import { validatedDefaultWizard } from '../../data/load-wizard';

const surroundingsField = validatedDefaultWizard.steps
    .flatMap((s) => s.sections)
    .flatMap((sec) => sec.fields)
    .find((f) => f.key === 'surroundings');

const SURROUNDINGS_OPTIONS =
    surroundingsField && 'options' in surroundingsField
        ? surroundingsField.options
        : [];

export function Step2SurroundingsSection({
    answers,
    onAnswerChange,
    isDisabled = false,
}: Step2SurroundingsSectionProps): React.JSX.Element {
    const { t, i18n } = useTranslation();

    const surroundingsAnswer = answers.surroundings;
    const selectedValues: readonly string[] = Array.isArray(surroundingsAnswer)
        ? surroundingsAnswer.filter((v): v is string => typeof v === 'string')
        : ['residential'];

    const otherText =
        typeof answers.land_surroundings_other === 'string'
            ? answers.land_surroundings_other
            : '';

    const handleToggle = (val: string, isChecked: boolean): void => {
        if (isChecked) {
            if (!selectedValues.includes(val)) {
                onAnswerChange('surroundings', [...selectedValues, val]);
            }
        } else {
            onAnswerChange(
                'surroundings',
                selectedValues.filter((v) => v !== val),
            );
        }
    };

    return (
        <div className="flex flex-col justify-between h-full w-full">
            {/* Checkbox grid: 2 cols on mobile, 3 on sm/xl */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-2 py-1">
                {SURROUNDINGS_OPTIONS.map((opt) => {
                    const isChecked = selectedValues.includes(opt.value);
                    const optId = `surroundings-${opt.value}`;

                    return (
                        <button
                            key={opt.value}
                            type="button"
                            role="checkbox"
                            id={optId}
                            aria-checked={isChecked}
                            disabled={isDisabled}
                            onClick={() => {
                                handleToggle(opt.value, !isChecked);
                            }}
                            className="flex items-center gap-2 cursor-pointer select-none text-left focus:outline-none group"
                        >
                            <span
                                className={cn(
                                    'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                                    isChecked
                                        ? 'bg-primary border-primary text-white shadow-2xs'
                                        : 'bg-white border-slate-300 group-hover:border-slate-400',
                                    isDisabled &&
                                        'opacity-50 cursor-not-allowed',
                                )}
                            >
                                {isChecked ? (
                                    <Check
                                        className="h-3 w-3 stroke-[3]"
                                        aria-hidden="true"
                                    />
                                ) : null}
                            </span>
                            <span className="text-sm xl:text-[13px] font-medium text-slate-700">
                                {resolveLocalized(opt.label, i18n.language)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Other details input - always visible */}
            <div className="w-full mt-3">
                <Input
                    id="land_surroundings_other"
                    type="text"
                    value={otherText}
                    onChange={(e) => {
                        onAnswerChange(
                            'land_surroundings_other',
                            e.target.value,
                        );
                    }}
                    placeholder={t('wizard:otherDetailsPlaceholder')}
                    disabled={isDisabled}
                    maxLength={100}
                    className="h-10 text-sm bg-white border-slate-300"
                />
            </div>
        </div>
    );
}
