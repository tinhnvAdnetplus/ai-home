import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { type Field } from '@aihome/config-schema';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/RadioGroup';
import { cn } from '@/shared/lib/cn';
import { FieldHeader } from './FieldHeader';
import {
    resolveLocalized,
    type CommonFieldProps,
} from '../../lib/field-helpers';

type RadioField = Extract<Field, { type: 'radio' }>;
type Props = CommonFieldProps<RadioField, string>;

export function RadioRenderer({
    field,
    value,
    onChange,
    isDisabled = false,
    disabledOptions = [],
    error,
}: Props): React.JSX.Element {
    const { i18n } = useTranslation();
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;

    const helpText = resolveLocalized(field.help, i18n.language);

    return (
        <div className="w-full flex-1 flex flex-col justify-start">
            <div>
                <FieldHeader
                    id={id}
                    label={field.label}
                    required={field.required}
                />
                <RadioGroup
                    value={value}
                    onValueChange={onChange}
                    disabled={isDisabled}
                    className="flex flex-col gap-0"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={errorId}
                >
                    {field.options.map((opt) => {
                        const isOptDisabled =
                            isDisabled || disabledOptions.includes(opt.value);
                        const optionId = `${id}-${opt.value}`;
                        const isSelected = value === opt.value;
                        const isStep4Radio = field.key.startsWith('life_');

                        return (
                            <label
                                key={opt.value}
                                htmlFor={optionId}
                                className={cn(
                                    'flex cursor-pointer items-center rounded px-1 transition-colors hover:bg-slate-50',
                                    isStep4Radio
                                        ? 'min-h-[44px] py-1 gap-2 text-sm xl:min-h-0 xl:h-[26px] xl:py-0 xl:text-[12px]'
                                        : 'min-h-[44px] py-1.5 gap-2.5 text-sm xl:min-h-0 xl:h-[31px] xl:py-0 xl:text-[13.5px]',
                                    isSelected
                                        ? 'font-bold text-[#0c243c]'
                                        : 'font-normal text-slate-700',
                                    isOptDisabled &&
                                        'pointer-events-none opacity-40',
                                )}
                            >
                                <RadioGroupItem
                                    id={optionId}
                                    value={opt.value}
                                    disabled={isOptDisabled}
                                    className={cn(
                                        'shrink-0 border-[1.5px] border-slate-300 data-[state=checked]:border-primary',
                                        isStep4Radio
                                            ? 'h-3.5 w-3.5'
                                            : 'h-[17px] w-[17px]',
                                    )}
                                />
                                <span className="leading-tight">
                                    {resolveLocalized(opt.label, i18n.language)}
                                </span>
                            </label>
                        );
                    })}
                </RadioGroup>
            </div>
            {helpText ? (
                <p className="mt-3 text-[11px] xl:text-[12px] text-slate-400 leading-normal">
                    {helpText}
                </p>
            ) : null}
            {error ? (
                <p
                    id={errorId}
                    role="alert"
                    className="mt-1 text-xs text-destructive"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}
