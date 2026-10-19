import { type Field } from '@aihome/config-schema';
import { TextRenderer } from './TextRenderer';
import { TextareaRenderer } from './TextareaRenderer';
import { NumberRenderer } from './NumberRenderer';
import { RangeRenderer } from './RangeRenderer';
import { SelectRenderer } from './SelectRenderer';
import { RadioRenderer } from './RadioRenderer';
import { CheckboxGroupRenderer } from './CheckboxGroupRenderer';
import { ImageSelectRenderer } from './ImageSelectRenderer';
import { BooleanRenderer } from './BooleanRenderer';
import { UploadRenderer } from './UploadRenderer';

type FieldRendererProps = {
    readonly field: Field;
    readonly value: unknown;
    readonly onChange: (key: string, value: unknown) => void;
    readonly isVisible?: boolean | undefined;
    readonly isDisabled?: boolean | undefined;
    readonly disabledOptions?: readonly string[] | undefined;
    readonly error?: string | undefined;
};

export function FieldRenderer({
    field,
    value,
    onChange,
    isVisible = true,
    isDisabled = false,
    disabledOptions = [],
    error,
}: FieldRendererProps): React.JSX.Element | null {
    if (!isVisible) {
        return null;
    }

    const handleChange = (newVal: unknown): void => {
        onChange(field.key, newVal);
    };

    switch (field.type) {
        case 'text':
            return (
                <TextRenderer
                    field={field}
                    value={typeof value === 'string' ? value : ''}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    error={error}
                />
            );
        case 'textarea':
            return (
                <TextareaRenderer
                    field={field}
                    value={typeof value === 'string' ? value : ''}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    error={error}
                />
            );
        case 'number':
            return (
                <NumberRenderer
                    field={field}
                    value={typeof value === 'number' ? value : undefined}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    error={error}
                />
            );
        case 'range':
            return (
                <RangeRenderer
                    field={field}
                    value={typeof value === 'number' ? value : undefined}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    error={error}
                />
            );
        case 'select':
            return (
                <SelectRenderer
                    field={field}
                    value={typeof value === 'string' ? value : undefined}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    disabledOptions={disabledOptions}
                    error={error}
                />
            );
        case 'radio':
            return (
                <RadioRenderer
                    field={field}
                    value={typeof value === 'string' ? value : undefined}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    disabledOptions={disabledOptions}
                    error={error}
                />
            );
        case 'checkbox_group':
            return (
                <CheckboxGroupRenderer
                    field={field}
                    value={Array.isArray(value) ? value : []}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    disabledOptions={disabledOptions}
                    error={error}
                />
            );
        case 'image_select':
            return (
                <ImageSelectRenderer
                    field={field}
                    value={
                        typeof value === 'string' || Array.isArray(value)
                            ? value
                            : undefined
                    }
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    disabledOptions={disabledOptions}
                    error={error}
                />
            );
        case 'boolean':
            return (
                <BooleanRenderer
                    field={field}
                    value={typeof value === 'boolean' ? value : undefined}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    error={error}
                />
            );
        case 'upload':
            return (
                <UploadRenderer
                    field={field}
                    value={Array.isArray(value) ? value : []}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    error={error}
                />
            );
    }
}
