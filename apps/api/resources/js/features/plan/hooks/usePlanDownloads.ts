import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type Plan } from '@aihome/planner';
import { type MaterialOptions } from '@aihome/render3d';
import {
    downloadJson,
    downloadSvg,
    downloadBlob,
    downloadDataUrl,
    exportDxf,
} from '../lib/export-helpers';
import {
    svgStringToPngDataUrl,
    get3dCanvasSnapshot,
} from '../lib/image-rasterize';
import { exportProposalPdf } from '../lib/pdf-export';
import { type AiCommentaryItem } from '@/features/ai';

type UsePlanDownloadsProps = {
    readonly plan: Plan;
    readonly currentView: '2d' | '3d' | 'elevations';
    readonly projectId: number | null;
    readonly answers?: Record<string, unknown> | undefined;
    readonly materials?: MaterialOptions | undefined;
    readonly commentary?: AiCommentaryItem | undefined;
    readonly getSvgElement?: (() => SVGSVGElement | null) | undefined;
};

export function usePlanDownloads({
    plan,
    currentView,
    projectId,
    answers,
    materials,
    commentary,
    getSvgElement,
}: UsePlanDownloadsProps): {
    readonly isExportingDxf: boolean;
    readonly isExportingPdf: boolean;
    readonly exportError: string | null;
    readonly isPdfDisabled: boolean;
    readonly dxfVersion: 'R2000' | 'R12';
    readonly setDxfVersion: (version: 'R2000' | 'R12') => void;
    readonly handleDownloadJson: () => void;
    readonly handleDownloadSvg: () => void;
    readonly handleDownloadDxf: () => Promise<void>;
    readonly handleDownloadPng: () => Promise<void>;
    readonly handleDownloadPdf: () => Promise<void>;
} {
    const { t, i18n } = useTranslation();
    const [dxfVersion, setDxfVersion] = useState<'R2000' | 'R12'>('R2000');
    const [isExportingDxf, setIsExportingDxf] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const handleDownloadJson = useCallback(() => {
        downloadJson(plan.model, `${plan.id}-model.json`);
    }, [plan.model, plan.id]);

    const handleDownloadSvg = useCallback(() => {
        const svgEl = getSvgElement?.();
        if (!svgEl) return;
        const serializer = new XMLSerializer();
        downloadSvg(
            serializer.serializeToString(svgEl),
            `${plan.id}-floorplan.svg`,
        );
    }, [getSvgElement, plan.id]);

    const handleDownloadDxf = useCallback(async () => {
        setIsExportingDxf(true);
        try {
            const { content, filename } = await exportDxf(plan.model, {
                version: dxfVersion,
                prefix: plan.id,
            });
            downloadBlob(
                new Blob([content], { type: 'application/dxf' }),
                filename,
            );
        } finally {
            setIsExportingDxf(false);
        }
    }, [plan.model, plan.id, dxfVersion]);

    const handleDownloadPng = useCallback(async () => {
        if (currentView === '3d') {
            const shot = get3dCanvasSnapshot();
            if (shot) {
                downloadDataUrl(shot, `${plan.id}-3d.png`);
                return;
            }
        }
        const svgEl = getSvgElement?.();
        if (!svgEl) return;
        const serializer = new XMLSerializer();
        const pngUrl = await svgStringToPngDataUrl(
            serializer.serializeToString(svgEl),
        );
        downloadDataUrl(pngUrl, `${plan.id}-view.png`);
    }, [currentView, getSvgElement, plan.id]);

    const handleDownloadPdf = useCallback(async () => {
        setIsExportingPdf(true);
        setExportError(null);
        try {
            await exportProposalPdf({
                projectId,
                plan,
                answers,
                materials,
                getSvgElement,
                commentary,
                locale: i18n.language,
            });
        } catch {
            setExportError(t('plan:pdfExportError'));
        } finally {
            setIsExportingPdf(false);
        }
    }, [
        projectId,
        plan,
        answers,
        materials,
        getSvgElement,
        commentary,
        i18n.language,
        t,
    ]);

    const isPdfDisabled = isExportingPdf;

    return {
        isExportingDxf,
        isExportingPdf,
        exportError,
        isPdfDisabled,
        dxfVersion,
        setDxfVersion,
        handleDownloadJson,
        handleDownloadSvg,
        handleDownloadDxf,
        handleDownloadPng,
        handleDownloadPdf,
    };
}
