import { useId } from 'react';
import { type Field } from '@aihome/config-schema';
import { FieldHeader } from './FieldHeader';
import { type CommonFieldProps } from '../../lib/field-helpers';

type RangeField = Extract<Field, { type: 'range' }>;
type Props = CommonFieldProps<RangeField, number>;

export function RangeRenderer({
    field,
    value = field.defaultValue ?? field.min,
    onChange,
    isDisabled = false,
    error,
}: Props): React.JSX.Element {
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className="w-full">
            <FieldHeader
                id={id}
                label={field.label}
                required={field.required}
                help={field.help}
            />
            <div className="flex flex-col gap-2 max-w-md">
                <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground">
                        {field.min} {field.unit}
                    </span>
                    <span className="text-base font-bold text-primary px-3 py-1 bg-brand-50 dark:bg-brand-950 rounded-full border border-brand-200 dark:border-brand-800">
                        {value} {field.unit}
                    </span>
                    <span className="text-muted-foreground">
                        {field.max} {field.unit}
                    </span>
                </div>
                <input
                    id={id}
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value}
                    disabled={isDisabled}
                    onChange={(e) => {
                        onChange(Number(e.target.value));
                    }}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={errorId}
                />
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
