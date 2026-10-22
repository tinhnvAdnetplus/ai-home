import { useTranslation } from 'react-i18next';
import { FileText, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

type Props = {
    /** Media references, as stored in the upload answer. */
    readonly files: readonly string[];
    readonly onRemove: (index: number) => void;
};

export function Step2DrawingsPhotosFileList({
    files,
    onRemove,
}: Props): React.JSX.Element | null {
    const { t } = useTranslation();

    if (files.length === 0) return null;

    return (
        <div className="mt-1 flex flex-col gap-1.5">
            {files.map((name, idx) => (
                <div
                    key={`${name}-${idx.toString()}`}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                    <div className="flex items-center gap-2 truncate">
                        <FileText
                            className="w-3.5 h-3.5 text-primary shrink-0"
                            aria-hidden="true"
                        />
                        <span className="truncate font-medium text-slate-800">
                            {name}
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(idx);
                        }}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="sr-only">
                            {t('wizard:uploadRemove')}
                        </span>
                    </Button>
                </div>
            ))}
        </div>
    );
}
