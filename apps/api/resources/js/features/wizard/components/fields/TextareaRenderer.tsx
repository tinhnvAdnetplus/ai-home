import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { type Field } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { Textarea } from '@/shared/ui/Textarea';
import { FieldHeader } from './FieldHeader';
import {
    resolveLocalized,
    type CommonFieldProps,
} from '../../lib/field-helpers';

type TextareaField = Extract<Field, { type: 'textarea' }>;
type Props = CommonFieldProps<TextareaField, string>;

export function TextareaRenderer({
    field,
    value = '',
    onChange,
    isDisabled = false,
    error,
}: Props): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const placeholder = resolveLocalized(field.placeholder, i18n.language);
    const maxLen = field.maxLength ?? 2000;
    const isLifeNotes = field.key === 'life_notes';

    return (
        <div className="w-full flex-1 flex flex-col">
            <FieldHeader
                id={id}
                label={field.label}
                required={field.required}
                help={field.help}
            />
            <div
                className={cn(
                    'relative flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
                    isLifeNotes
                        ? 'flex-1 min-h-[90px] xl:min-h-[105px] xl:h-[105px]'
                        : 'min-h-[46px] xl:min-h-[48px] xl:h-[48px]',
                )}
            >
                <Textarea
                    id={id}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    disabled={isDisabled}
                    placeholder={placeholder}
                    maxLength={maxLen}
                    rows={isLifeNotes ? 3 : 1}
                    className={cn(
                        'w-full resize-none border-0 bg-transparent p-0 text-[16px] sm:text-xs xl:text-[12px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:outline-none',
                        isLifeNotes ? 'h-[72px] pr-2' : 'h-full min-h-0 pr-16',
                    )}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={errorId}
                />
                {field.showCounter ? (
                    <span className="pointer-events-none absolute bottom-1.5 right-3 text-xs xl:text-[11.5px] text-slate-400 font-normal">
                        {t('wizard:charactersCount', {
                            count: value.length,
                            max: maxLen,
                        })}
                    </span>
                ) : null}
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
