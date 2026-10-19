import * as THREE from 'three';
import { type Parking } from '@aihome/bdm';
import { createContactShadowContext } from './contact-shadow.js';
import { SPACE_W } from './site-plan.js';
import { type MaterialRegistry } from './types.js';

function addWheel(group: THREE.Group, x: number, y: number, z: number, reg: MaterialRegistry): void {
    const tireGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12);
    tireGeo.rotateZ(Math.PI / 2);
    reg.trackGeometry(tireGeo);
    const tire = new THREE.Mesh(tireGeo, reg.carTire);
    tire.position.set(x, y, z);
    tire.castShadow = true;

    const hubGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.19, 8);
    hubGeo.rotateZ(Math.PI / 2);
    reg.trackGeometry(hubGeo);
    const hub = new THREE.Mesh(hubGeo, reg.carWheel);
    hub.position.set(x, y, z);
    group.add(tire, hub);
}

function addStylizedCar(group: THREE.Group, cx: number, cz: number, reg: MaterialRegistry): void {
    const car = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.48, 4.1);
    reg.trackGeometry(bodyGeo);
    const body = new THREE.Mesh(bodyGeo, reg.carBody);
    body.position.set(0, 0.42, 0);
    body.castShadow = true;

    const cabinGeo = new THREE.BoxGeometry(1.5, 0.48, 2.2);
    reg.trackGeometry(cabinGeo);
    const cabin = new THREE.Mesh(cabinGeo, reg.carGlass);
    cabin.position.set(0, 0.86, -0.15);
    cabin.castShadow = true;

    const roofGeo = new THREE.BoxGeometry(1.42, 0.05, 1.85);
    reg.trackGeometry(roofGeo);
    const roof = new THREE.Mesh(roofGeo, reg.carBody);
    roof.position.set(0, 1.12, -0.15);
    roof.castShadow = true;

    const lightGeo = new THREE.BoxGeometry(0.24, 0.12, 0.04);
    reg.trackGeometry(lightGeo);
    const headlightL = new THREE.Mesh(lightGeo, reg.fixtureCeramic);
    headlightL.position.set(-0.6, 0.45, 2.06);
    const headlightR = new THREE.Mesh(lightGeo, reg.fixtureCeramic);
    headlightR.position.set(0.6, 0.45, 2.06);

    car.add(body, cabin, roof, headlightL, headlightR);
    addWheel(car, -0.85, 0.28, 1.25, reg);
    addWheel(car, 0.85, 0.28, 1.25, reg);
    addWheel(car, -0.85, 0.28, -1.25, reg);
    addWheel(car, 0.85, 0.28, -1.25, reg);

    car.position.set(cx, 0, cz);
    group.add(car);
}

function addCarport(
    group: THREE.Group,
    x: number,
    z: number,
    w: number,
    d: number,
    reg: MaterialRegistry,
): void {
    const postH = 2.4;
    const hw = w / 2 - 0.2;
    const hd = d / 2 - 0.2;
    for (const [px, pz] of [
        [x - hw, z - hd],
        [x + hw, z - hd],
        [x - hw, z + hd],
        [x + hw, z + hd],
    ] as const) {
        const pGeo = new THREE.BoxGeometry(0.08, postH, 0.08);
        reg.trackGeometry(pGeo);
        const post = new THREE.Mesh(pGeo, reg.carportFrame);
        post.position.set(px, postH / 2, pz);
        post.castShadow = true;
        group.add(post);
    }

    const roofGeo = new THREE.BoxGeometry(w + 0.3, 0.04, d + 0.3);
    reg.trackGeometry(roofGeo);
    const roof = new THREE.Mesh(roofGeo, reg.carportRoof);
    roof.position.set(x, postH + 0.02, z);
    roof.castShadow = true;
    group.add(roof);
}

export function buildParkingArea(
    parking: Parking,
    posX: number,
    posZ: number,
    depth: number,
    reg: MaterialRegistry,
    padWidth?: number,
): { readonly group: THREE.Group; readonly dispose: () => void } {
    const group = new THREE.Group();
    group.name = 'parking-area';
    const shadowCtx = createContactShadowContext();

    const spaces = Math.max(1, parking.spaces);
    const padW = padWidth ?? spaces * SPACE_W;
    const padGeo = new THREE.BoxGeometry(padW, 0.04, depth);
    reg.trackGeometry(padGeo);
    const padMesh = new THREE.Mesh(padGeo, reg.parking);
    padMesh.position.set(posX, 0.02, posZ);
    padMesh.receiveShadow = true;
    group.add(padMesh);

    if (parking.kind === 'carport') {
        addCarport(group, posX, posZ, padW, depth, reg);
    }

    const slotW = padW / spaces;
    const firstCarX = posX - padW / 2 + slotW / 2;
    const shadow1 = shadowCtx.createShadowMesh(2.4, Math.min(4.6, depth), 0.55);
    shadow1.position.set(firstCarX, 0.025, posZ);
    group.add(shadow1);
    addStylizedCar(group, firstCarX, posZ, reg);

    if (spaces >= 2) {
        const secondCarX = firstCarX + slotW;
        const shadow2 = shadowCtx.createShadowMesh(2.4, Math.min(4.6, depth), 0.55);
        shadow2.position.set(secondCarX, 0.025, posZ);
        group.add(shadow2);
        addStylizedCar(group, secondCarX, posZ, reg);
    }

    return {
        group,
        dispose: () => {
            shadowCtx.dispose();
            group.clear();
        },
    };
}
