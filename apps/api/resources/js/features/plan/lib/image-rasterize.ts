const MAX_IMAGE_BYTES = 1_150_000;

export async function svgStringToPngDataUrl(
    svgString: string,
    initialMaxDim = 1200,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const blob = new Blob([svgString], {
            type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            URL.revokeObjectURL(url);
            let dim = initialMaxDim;
            let resultDataUrl = '';

            for (let attempt = 0; attempt < 4; attempt++) {
                let w = img.naturalWidth || img.width || 800;
                let h = img.naturalHeight || img.height || 600;

                if (w > dim || h > dim) {
                    const ratio = Math.min(dim / w, dim / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = Math.max(w, 200);
                canvas.height = Math.max(h, 200);

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas 2D context unavailable'));
                    return;
                }

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                resultDataUrl = canvas.toDataURL('image/png', 0.85);
                const estBytes = (resultDataUrl.length * 3) / 4;
                if (estBytes <= MAX_IMAGE_BYTES) break;
                dim = Math.round(dim * 0.75);
            }

            resolve(resultDataUrl);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load SVG for rasterization'));
        };

        img.src = url;
    });
}

export function get3dCanvasSnapshot(): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const canvases = Array.from(document.querySelectorAll('canvas'));
    const canvas3d = canvases.find((c) => {
        return c.clientWidth > 200 && c.clientHeight > 200;
    });
    if (!canvas3d) return undefined;
    try {
        return canvas3d.toDataURL('image/png', 0.85);
    } catch {
        return undefined;
    }
}
