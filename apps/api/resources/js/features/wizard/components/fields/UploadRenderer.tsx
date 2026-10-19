import { useId, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, X, FileText } from 'lucide-react';
import { type Field } from '@aihome/config-schema';
import { Button } from '@/shared/ui/Button';
import { FieldHeader } from './FieldHeader';
import { type CommonFieldProps } from '../../lib/field-helpers';

type UploadField = Extract<Field, { type: 'upload' }>;
type UploadedFileItem = {
    readonly name: string;
    readonly size: number;
};
type Props = CommonFieldProps<UploadField, readonly UploadedFileItem[]>;

export function UploadRenderer({
    field,
    value = [],
    onChange,
    isDisabled = false,
    error,
}: Props): React.JSX.Element {
    const { t } = useTranslation();
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const errorId = error ? `${id}-error` : undefined;

    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (fileList: FileList | null): void => {
        if (!fileList || fileList.length === 0) return;
        const newFiles: UploadedFileItem[] = [];
        for (let i = 0; i < fileList.length; i += 1) {
            const f = fileList.item(i);
            if (f) {
                newFiles.push({ name: f.name, size: f.size });
            }
        }
        const merged = [...value, ...newFiles].slice(0, field.maxFiles);
        onChange(merged);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        handleFiles(e.target.files);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const removeFile = (index: number): void => {
        onChange(value.filter((_, idx) => idx !== index));
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
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer bg-card ${
                    isDragging
                        ? 'border-primary bg-brand-50/50'
                        : 'border-border hover:border-brand-400'
                } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => {
                    setIsDragging(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                onClick={() => {
                    inputRef.current?.click();
                }}
                role="presentation"
            >
                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    multiple={field.maxFiles > 1}
                    accept={field.accept.join(',')}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    className="hidden"
                />
                <UploadCloud
                    className="w-10 h-10 text-muted-foreground mb-2"
                    aria-hidden="true"
                />
                <p className="text-sm font-semibold text-foreground">
                    {t('wizard:uploadPlaceholder')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {t('wizard:uploadHint')}
                </p>
            </div>

            {value.length > 0 ? (
                <div className="mt-3 flex flex-col gap-2">
                    {value.map((f, idx) => (
                        <div
                            key={`${f.name}-${idx.toString()}`}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <FileText
                                    className="w-4 h-4 text-primary shrink-0"
                                    aria-hidden="true"
                                />
                                <span className="truncate font-medium">
                                    {f.name}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    {`(${Math.round(f.size / 1024).toString()} KB)`}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(idx);
                                }}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                                <span className="sr-only">
                                    {t('wizard:uploadRemove')}
                                </span>
                            </Button>
                        </div>
                    ))}
                </div>
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
