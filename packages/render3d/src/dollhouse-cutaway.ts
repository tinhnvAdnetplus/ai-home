import * as THREE from 'three';

export type WallCutawayItem = {
    readonly fullGroup: THREE.Group;
    readonly cutGroup: THREE.Group;
    readonly normal: THREE.Vector2;
    readonly center: THREE.Vector2;
    readonly isExterior: boolean;
};

export type DollhouseCutawayContext = {
    readonly items: WallCutawayItem[];
    readonly whiteCutTopMaterial: THREE.Material;
    readonly addItem: (item: WallCutawayItem) => void;
    readonly update: (camPos: THREE.Vector3) => void;
    readonly setAllFull: () => void;
    readonly dispose: () => void;
};

export function createDollhouseCutawayContext(
    buildingCenter: THREE.Vector3,
): DollhouseCutawayContext {
    const items: WallCutawayItem[] = [];
    const whiteCutTopMaterial = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.9,
        metalness: 0.0,
    });

    let lastAzimuth = Number.NaN;

    function addItem(item: WallCutawayItem): void {
        items.push(item);
    }

    function setAllFull(): void {
        for (const item of items) {
            item.fullGroup.visible = true;
            item.cutGroup.visible = false;
        }
    }

    function update(camPos: THREE.Vector3): void {
        const dx = camPos.x - buildingCenter.x;
        const dz = camPos.z - buildingCenter.z;
        const azimuth = Math.atan2(dx, dz);

        if (
            !Number.isNaN(lastAzimuth) &&
            Math.abs(azimuth - lastAzimuth) < 0.035
        ) {
            return;
        }
        lastAzimuth = azimuth;

        const len = Math.hypot(dx, dz) || 1;
        const dirX = dx / len;
        const dirZ = dz / len;

        for (const item of items) {
            if (item.isExterior) {
                const dot = item.normal.x * dirX + item.normal.y * dirZ;
                const isFacingCamera = dot > -0.15;
                item.cutGroup.visible = isFacingCamera;
                item.fullGroup.visible = !isFacingCamera;
            } else {
                const dot = Math.abs(
                    item.normal.x * dirX + item.normal.y * dirZ,
                );
                const distToCam =
                    (item.center.x - buildingCenter.x) * dirX +
                    (item.center.y - buildingCenter.z) * dirZ;
                const isFacingCamera = distToCam > -0.6 && dot > 0.35;
                item.cutGroup.visible = isFacingCamera;
                item.fullGroup.visible = !isFacingCamera;
            }
        }
    }

    function dispose(): void {
        whiteCutTopMaterial.dispose();
        items.length = 0;
    }

    return {
        items,
        whiteCutTopMaterial,
        addItem,
        update,
        setAllFull,
        dispose,
    };
}
