import { useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud } from 'lucide-react';
import { Step2DrawingsPhotosThumbnails } from './Step2DrawingsPhotosThumbnails';
import { Step2DrawingsPhotosFileList } from './Step2DrawingsPhotosFileList';

type Props = {
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
    readonly errors?: Record<string, string> | undefined;
};

export function Step2DrawingsPhotosSection({
    answers,
    onAnswerChange,
    isDisabled = false,
}: Props): React.JSX.Element {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // An upload answer is a list of media references (strings), per AnswerValue:
    // storing {name, size} objects made every draft save fail with HTTP 422.
    const rawFiles = answers.land_survey_file;
    const fileNames: readonly string[] = Array.isArray(rawFiles)
        ? rawFiles.filter((item): item is string => typeof item === 'string')
        : typeof rawFiles === 'string'
          ? [rawFiles]
          : [];

    const handleFiles = (fileList: FileList | null): void => {
        if (!fileList || fileList.length === 0) return;
        const newNames: string[] = [];
        for (let i = 0; i < fileList.length; i += 1) {
            const f = fileList.item(i);
            if (f) newNames.push(f.name);
        }
        onAnswerChange(
            'land_survey_file',
            [...fileNames, ...newNames].slice(0, 3),
        );
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        handleFiles(e.target.files);
        if (inputRef.current) inputRef.current.value = '';
    };

    const removeFile = (index: number): void => {
        onAnswerChange(
            'land_survey_file',
            fileNames.filter((_, idx) => idx !== index),
        );
    };

    return (
        <div className="flex flex-col gap-2 w-full h-full">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full flex-1">
                {/* Left Upload Zone */}
                <div
                    className={`w-full sm:w-[44%] shrink-0 flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-2xl transition-colors cursor-pointer bg-[#F0F7FF] border-[#60A5FA] hover:bg-sky-50 min-h-[96px] text-center ${
                        isDragging ? 'border-primary bg-sky-100/60' : ''
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
                        id="land_survey_file"
                        type="file"
                        multiple
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        onChange={handleInputChange}
                        disabled={isDisabled}
                        className="hidden"
                    />
                    <UploadCloud
                        className="w-7 h-7 text-primary mb-1"
                        aria-hidden="true"
                    />
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                        {t('wizard:uploadPlaceholder')}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        {t('wizard:uploadHintPdfImage')}
                    </p>
                </div>

                <Step2DrawingsPhotosThumbnails />
            </div>

            <Step2DrawingsPhotosFileList
                files={fileNames}
                onRemove={removeFile}
            />
        </div>
    );
}
