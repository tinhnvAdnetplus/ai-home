import * as THREE from 'three';

function createFallbackTexture(): THREE.Texture {
    const data = new Uint8Array([220, 220, 220, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
}

export function createSidingTexture(
    isLightVariant = false,
): THREE.CanvasTexture | THREE.Texture {
    if (typeof document === 'undefined') {
        return createFallbackTexture();
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const plankCount = 8;
    const plankH = canvas.height / plankCount;

    for (let i = 0; i < plankCount; i += 1) {
        const y = i * plankH;
        const grad = ctx.createLinearGradient(0, y, 0, y + plankH);
        if (isLightVariant) {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.8, '#f7f6f2');
            grad.addColorStop(1, '#e2dfd7');
        } else {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.8, '#f4f5f7');
            grad.addColorStop(1, '#dfe1e6');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, canvas.width, plankH);

        // Top crisp highlight line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fillRect(0, y, canvas.width, 1.5);

        // Bottom shadow groove seam
        ctx.fillStyle = isLightVariant
            ? 'rgba(0, 0, 0, 0.16)'
            : 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(0, y + plankH - 2.5, canvas.width, 2.5);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, y + plankH - 1, canvas.width, 1);

        // Staggered vertical joints
        const jointX = (i % 2 === 0 ? 80 : 190) + ((i * 17) % 30);
        ctx.fillStyle = isLightVariant
            ? 'rgba(0, 0, 0, 0.12)'
            : 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(jointX, y, 1, plankH - 2.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

export function createRoofStandingSeamTexture():
    THREE.CanvasTexture | THREE.Texture {
    if (typeof document === 'undefined') {
        return createFallbackTexture();
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#d8dade';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const seamCount = 4;
    const seamSpacing = canvas.width / seamCount;

    for (let i = 0; i < seamCount; i += 1) {
        const x = i * seamSpacing;

        const panGrad = ctx.createLinearGradient(x, 0, x + seamSpacing, 0);
        panGrad.addColorStop(0, 'rgba(0, 0, 0, 0.06)');
        panGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        panGrad.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = panGrad;
        ctx.fillRect(x, 0, seamSpacing, canvas.height);

        // Drop shadow on the right of the seam
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(x + 2.5, 0, 2.5, canvas.height);

        // Raised standing seam rib
        ctx.fillStyle = 'rgba(32, 36, 42, 0.95)';
        ctx.fillRect(x, 0, 2.5, canvas.height);

        // Specular highlight crest along the rib
        const highlightX = x === 0 ? canvas.width - 1 : x - 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(highlightX, 0, 1.5, canvas.height);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}
