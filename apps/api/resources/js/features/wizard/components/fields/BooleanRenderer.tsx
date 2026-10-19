import { useId } from 'react';
import { type Field } from '@aihome/config-schema';
import { Checkbox } from '@/shared/ui/Checkbox';
import { FieldHeader } from './FieldHeader';
import { type CommonFieldProps } from '../../lib/field-helpers';

type BooleanField = Extract<Field, { type: 'boolean' }>;
type Props = CommonFieldProps<BooleanField, boolean>;

export function BooleanRenderer({
    field,
    value: isChecked = field.defaultValue ?? false,
    onChange,
    isDisabled = false,
    error,
}: Props): React.JSX.Element {
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className="w-full">
            <div className="flex items-center gap-3">
                <Checkbox
                    id={id}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                        onChange(Boolean(checked));
                    }}
                    disabled={isDisabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={errorId}
                />
                <FieldHeader
                    id={id}
                    label={field.label}
                    required={field.required}
                    help={field.help}
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
