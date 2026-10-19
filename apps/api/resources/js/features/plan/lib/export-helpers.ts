import { type BuildingModel } from '@aihome/bdm';

export function downloadBlob(blob: Blob, filename: string): void {
    if (typeof window === 'undefined') return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
    if (typeof window === 'undefined') return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function downloadJson(data: unknown, filename: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, filename);
}

export function downloadSvg(svgString: string, filename: string): void {
    const blob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
    });
    downloadBlob(blob, filename);
}

export type DxfExportResult = {
    readonly content: string;
    readonly filename: string;
};

export async function exportDxf(
    model: BuildingModel,
    options?: { readonly version?: 'R2000' | 'R12'; readonly prefix?: string },
): Promise<DxfExportResult> {
    const cad = await import('@aihome/cad-export');
    const version = options?.version ?? 'R2000';
    const prefix = options?.prefix ?? 'plan';
    const content = cad.exportDxf(model, { version });
    const filename = cad.dxfFileName(model, { prefix, version });
    return { content, filename };
}
