export function makeWoodCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#dfa86c';
    ctx.fillRect(0, 0, 512, 512);

    const plankCount = 8;
    const plankH = 512 / plankCount;
    for (let i = 0; i < plankCount; i += 1) {
        const y = i * plankH;
        ctx.fillStyle =
            i % 2 === 0 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.025)';
        ctx.fillRect(0, y, 512, plankH);

        ctx.strokeStyle = '#b88548';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();

        const jointX = (i * 197) % 512;
        ctx.beginPath();
        ctx.moveTo(jointX, y);
        ctx.lineTo(jointX, y + plankH);
        ctx.stroke();
    }
    return canvas;
}

export function makeEntranceCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#dededc';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#c4c4c2';
    ctx.lineWidth = 2;
    const step = 64;
    for (let i = 0; i <= 256; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
    }
    return canvas;
}

export function makeTatamiCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#b8c799';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#3a4a35';
    ctx.fillRect(0, 0, 14, 256);
    ctx.fillRect(242, 0, 14, 256);

    ctx.strokeStyle = 'rgba(140, 160, 110, 0.35)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 4) {
        ctx.beginPath();
        ctx.moveTo(14, y);
        ctx.lineTo(242, y);
        ctx.stroke();
    }
    return canvas;
}

export function makeTileCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#e4e8e5';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#c4c9c6';
    ctx.lineWidth = 3;
    const step = 64;
    for (let i = 0; i <= 256; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
    }
    return canvas;
}
