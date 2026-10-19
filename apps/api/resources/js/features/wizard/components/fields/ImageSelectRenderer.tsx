import { useId } from 'react';
import { type Field } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { getFieldGridColumns, toSelectedValues } from '../../lib/image-select';
import { ImageTile } from './ImageTile';
import { FieldHeader } from './FieldHeader';
import { type CommonFieldProps } from '../../lib/field-helpers';

type ImageSelectField = Extract<Field, { type: 'image_select' }>;
type Props = CommonFieldProps<ImageSelectField, string | readonly string[]>;

export function ImageSelectRenderer({
    field,
    value,
    onChange,
    isDisabled = false,
    disabledOptions = [],
    error,
}: Props): React.JSX.Element {
    const id = useId();
    const errorId = error ? `${id}-error` : undefined;
    const isMultiple = field.multiple;
    const isPhotoStyle2x2 =
        field.options.length === 4 &&
        field.options.every((o) => o.image.mediaId.startsWith('style-'));
    const isAccent = field.key.startsWith('design_');
    const isSwatchField = field.options.every((o) =>
        /^(color|floor)-/.test(o.image.mediaId),
    );
    const selected = toSelectedValues(isMultiple, value);

    const handlePick = (optionValue: string): void => {
        if (isDisabled) return;
        if (!isMultiple) {
            onChange(optionValue);
            return;
        }
        onChange(
            selected.includes(optionValue)
                ? selected.filter((v) => v !== optionValue)
                : [...selected, optionValue],
        );
    };

    const gridClass = isPhotoStyle2x2
        ? 'grid-cols-2'
        : getFieldGridColumns(field.key, field.options.length);

    return (
        <div className="w-full">
            <FieldHeader
                id={id}
                label={field.label}
                required={field.required}
                help={field.help}
            />
            <div
                id={id}
                role={isMultiple ? 'group' : 'radiogroup'}
                aria-labelledby={undefined}
                aria-describedby={errorId}
                className={
                    isSwatchField
                        ? 'flex flex-wrap gap-[3px]'
                        : cn('grid gap-2', gridClass)
                }
            >
                {field.options.map((opt) => (
                    <ImageTile
                        key={opt.value}
                        option={opt}
                        isMultiple={isMultiple}
                        isSelected={selected.includes(opt.value)}
                        isDisabled={
                            isDisabled || disabledOptions.includes(opt.value)
                        }
                        isAccent={isAccent}
                        onPick={handlePick}
                    />
                ))}
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
