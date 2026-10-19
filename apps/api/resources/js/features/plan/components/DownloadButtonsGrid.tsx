import { useTranslation } from 'react-i18next';
import {
    FileJson,
    FileText,
    Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';

type DownloadButtonsGridProps = {
    readonly isExportingDxf: boolean;
    readonly dxfVersion: 'R2000' | 'R12';
    readonly onDxfVersionChange: (version: 'R2000' | 'R12') => void;
    readonly onDownloadJson: () => void;
    readonly onDownloadSvg: () => void;
    readonly onDownloadPng: () => void;
    readonly onDownloadDxf: () => void;
};

export function DownloadButtonsGrid({
    isExportingDxf,
    dxfVersion,
    onDxfVersionChange,
    onDownloadJson,
    onDownloadSvg,
    onDownloadPng,
    onDownloadDxf,
}: DownloadButtonsGridProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="space-y-2.5 min-w-0 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownloadJson}
                    className="h-auto min-h-[44px] py-2 px-1 text-xs gap-1 font-semibold rounded-xl"
                >
                    <FileJson
                        className="h-3.5 w-3.5 text-slate-600 shrink-0"
                        aria-hidden="true"
                    />
                    <span className="truncate">{t('plan:downloadJson')}</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownloadSvg}
                    className="h-auto min-h-[44px] py-2 px-1 text-xs gap-1 font-semibold rounded-xl"
                >
                    <ImageIcon
                        className="h-3.5 w-3.5 text-slate-600 shrink-0"
                        aria-hidden="true"
                    />
                    <span className="truncate">{t('plan:downloadSvg')}</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownloadPng}
                    className="h-auto min-h-[44px] py-2 px-1 text-xs gap-1 font-semibold rounded-xl"
                >
                    <ImageIcon
                        className="h-3.5 w-3.5 text-blue-600 shrink-0"
                        aria-hidden="true"
                    />
                    <span className="truncate">{t('plan:downloadPng')}</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    isLoading={isExportingDxf}
                    onClick={onDownloadDxf}
                    className="h-auto min-h-[44px] py-2 px-1 text-xs gap-1 font-semibold rounded-xl"
                >
                    <FileText
                        className="h-3.5 w-3.5 text-slate-600 shrink-0"
                        aria-hidden="true"
                    />
                    <span className="truncate">{t('plan:downloadDxf')}</span>
                </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-600 px-1 pt-0.5 border-t border-slate-100 w-full min-w-0">
                <span className="font-semibold text-slate-700 shrink-0">
                    {t('plan:dxfVersion')}:
                </span>
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            onDxfVersionChange('R2000');
                        }}
                        className={
                            dxfVersion === 'R2000'
                                ? 'min-h-[32px] sm:min-h-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-900 shadow-2xs'
                                : 'min-h-[32px] sm:min-h-0 rounded-md px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900'
                        }
                    >
                        {t('plan:dxfR2000')}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onDxfVersionChange('R12');
                        }}
                        className={
                            dxfVersion === 'R12'
                                ? 'min-h-[32px] sm:min-h-0 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-900 shadow-2xs'
                                : 'min-h-[32px] sm:min-h-0 rounded-md px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900'
                        }
                    >
                        {t('plan:dxfR12')}
                    </button>
                </div>
            </div>
        </div>
    );
}
