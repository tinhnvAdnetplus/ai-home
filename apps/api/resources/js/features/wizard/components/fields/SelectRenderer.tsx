import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { type Field } from '@aihome/config-schema';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/Select';
import { FieldHeader } from './FieldHeader';
import {
    resolveLocalized,
    type CommonFieldProps,
} from '../../lib/field-helpers';

type SelectField = Extract<Field, { type: 'select' }>;
type Props = CommonFieldProps<SelectField, string>;

export function SelectRenderer({
    field,
    value,
    onChange,
    isDisabled = false,
    disabledOptions = [],
    error,
}: Props): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;

    const placeholder = field.placeholder
        ? resolveLocalized(field.placeholder, i18n.language)
        : t('wizard:selectPlaceholder');

    return (
        <div className="w-full">
            <FieldHeader
                id={id}
                label={field.label}
                required={field.required}
                help={field.help}
            />
            <div className="w-full">
                <Select
                    {...(value !== undefined ? { value } : {})}
                    onValueChange={onChange}
                    disabled={isDisabled}
                >
                    <SelectTrigger
                        id={id}
                        className="h-10 xl:h-[42px] min-h-[40px] xl:min-h-[42px] w-full rounded-lg border-slate-200 bg-white px-3.5 py-1 text-sm xl:text-[15px] text-slate-800"
                        aria-invalid={error ? true : undefined}
                        aria-describedby={errorId}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map((opt) => {
                            const isOptDisabled = disabledOptions.includes(
                                opt.value,
                            );
                            return (
                                <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    disabled={isOptDisabled}
                                >
                                    {resolveLocalized(opt.label, i18n.language)}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
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
