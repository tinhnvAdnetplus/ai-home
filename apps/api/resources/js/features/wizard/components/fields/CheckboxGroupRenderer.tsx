import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { type Field } from '@aihome/config-schema';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { FieldHeader } from './FieldHeader';
import {
    resolveLocalized,
    type CommonFieldProps,
} from '../../lib/field-helpers';

type CheckboxGroupField = Extract<Field, { type: 'checkbox_group' }>;
type Props = CommonFieldProps<CheckboxGroupField, readonly string[]>;

export function CheckboxGroupRenderer({
    field,
    value = [],
    onChange,
    isDisabled = false,
    disabledOptions = [],
    error,
}: Props): React.JSX.Element {
    const { i18n } = useTranslation();
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;

    const handleToggle = (optValue: string, isChecked: boolean): void => {
        if (isChecked) {
            if (!value.includes(optValue)) {
                onChange([...value, optValue]);
            }
        } else {
            onChange(value.filter((v) => v !== optValue));
        }
    };

    return (
        <div className="w-full">
            <FieldHeader
                id={id}
                label={field.label}
                required={field.required}
                help={field.help}
            />
            <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
                aria-invalid={error ? true : undefined}
                aria-describedby={errorId}
            >
                {field.options.map((opt) => {
                    const isOptDisabled =
                        isDisabled || disabledOptions.includes(opt.value);
                    const isChecked = value.includes(opt.value);
                    const optId = `${id}-${opt.value}`;

                    return (
                        <label
                            key={opt.value}
                            htmlFor={optId}
                            className={cn(
                                'relative flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[48px] select-none',
                                isChecked
                                    ? 'border-primary bg-brand-50/70 dark:bg-brand-950/40 text-foreground ring-1 ring-primary shadow-sm font-medium'
                                    : 'border-border bg-card hover:bg-muted/40 text-foreground',
                                isOptDisabled &&
                                    'opacity-40 cursor-not-allowed pointer-events-none',
                            )}
                        >
                            <Checkbox
                                id={optId}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                    handleToggle(opt.value, Boolean(checked));
                                }}
                                disabled={isOptDisabled}
                            />
                            <span className="text-sm leading-snug">
                                {resolveLocalized(opt.label, i18n.language)}
                            </span>
                        </label>
                    );
                })}
            </div>
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
