import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { type Plan } from '@aihome/planner';
import { type MaterialOptions } from '@aihome/render3d';
import { type AiCommentaryItem } from '@/features/ai';
import { usePlanDownloads } from '../hooks/usePlanDownloads';
import { DownloadButtonsGrid } from './DownloadButtonsGrid';

type DownloadBarProps = {
    readonly plan: Plan;
    readonly currentView: '2d' | '3d' | 'elevations';
    readonly projectId: number | null;
    readonly answers?: Record<string, unknown> | undefined;
    readonly materials?: MaterialOptions | undefined;
    readonly commentary?: AiCommentaryItem | undefined;
    readonly getSvgElement?: (() => SVGSVGElement | null) | undefined;
};

export function DownloadBar({
    plan,
    currentView,
    projectId,
    answers,
    materials,
    commentary,
    getSvgElement,
}: DownloadBarProps): React.JSX.Element {
    const { t } = useTranslation();
    const {
        isExportingDxf,
        exportError,
        dxfVersion,
        setDxfVersion,
        handleDownloadJson,
        handleDownloadSvg,
        handleDownloadDxf,
        handleDownloadPng,
    } = usePlanDownloads({
        plan,
        currentView,
        projectId,
        answers,
        materials,
        commentary,
        getSvgElement,
    });

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0b6bdc]">
                        <Download className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {t('plan:downloadTitle')}
                    </span>
                </div>
            </div>

            {exportError ? (
                <div className="text-xs text-rose-500 font-medium">
                    {exportError}
                </div>
            ) : null}

            <DownloadButtonsGrid
                isExportingDxf={isExportingDxf}
                dxfVersion={dxfVersion}
                onDxfVersionChange={setDxfVersion}
                onDownloadJson={handleDownloadJson}
                onDownloadSvg={handleDownloadSvg}
                onDownloadPng={() => {
                    void handleDownloadPng();
                }}
                onDownloadDxf={() => {
                    void handleDownloadDxf();
                }}
            />
        </div>
    );
}
