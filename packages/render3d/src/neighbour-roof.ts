import * as THREE from 'three';

export function createHippedRoofGeo(
    w: number,
    h: number,
    d: number,
): THREE.BufferGeometry {
    const hw = (w + 0.8) / 2;
    const hd = (d + 0.8) / 2;
    const rx = Math.max(1.0, w * 0.2);
    const positions = [
        // North face (-Z)
        -hw,
        0,
        -hd,
        hw,
        0,
        -hd,
        rx,
        h,
        0,
        -hw,
        0,
        -hd,
        rx,
        h,
        0,
        -rx,
        h,
        0,
        // South face (+Z)
        hw,
        0,
        hd,
        -hw,
        0,
        hd,
        -rx,
        h,
        0,
        hw,
        0,
        hd,
        -rx,
        h,
        0,
        rx,
        h,
        0,
        // West hip (-X)
        -hw,
        0,
        hd,
        -hw,
        0,
        -hd,
        -rx,
        h,
        0,
        // East hip (+X)
        hw,
        0,
        -hd,
        hw,
        0,
        hd,
        rx,
        h,
        0,
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.computeVertexNormals();
    return geo;
}
