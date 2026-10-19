import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { type Field } from '@aihome/config-schema';
import { Input } from '@/shared/ui/Input';
import { FieldHeader } from './FieldHeader';
import { getFieldPrefixIcon } from '../../lib/field-decorations';
import {
    resolveLocalized,
    type CommonFieldProps,
} from '../../lib/field-helpers';

type TextField = Extract<Field, { type: 'text' }>;
type Props = CommonFieldProps<TextField, string>;

export function TextRenderer({
    field,
    value = '',
    onChange,
    isDisabled = false,
    error,
}: Props): React.JSX.Element {
    const { i18n } = useTranslation();
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const placeholder = resolveLocalized(field.placeholder, i18n.language);
    const prefixIcon = getFieldPrefixIcon(field.key);

    return (
        <div className="w-full">
            <FieldHeader
                id={id}
                label={field.label}
                required={field.required}
                help={field.help}
            />
            <div className="flex items-center gap-2">
                {prefixIcon}
                <Input
                    id={id}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    disabled={isDisabled}
                    placeholder={placeholder}
                    maxLength={field.maxLength}
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
