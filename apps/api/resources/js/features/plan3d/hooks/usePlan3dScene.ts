import { useEffect, useRef, useState, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { buildScene } from '@aihome/render3d';
import { type RoomLabelItem } from '../components/RoomLabelsOverlay.js';
import {
    applyCameraPreset,
    setupCameraAndControls,
} from '../lib/camera-controller.js';
import {
    createWalkController,
    type WalkController,
} from '../lib/walk-controller.js';
import { startViewerLoop } from '../lib/viewer-loop.js';
import { setupLighting } from '../lib/lighting-controller.js';
import { computeRoomLabels } from '../lib/room-labels.js';
import {
    checkIsLowEnd,
    createThreeRenderer,
    teardownThreeResources,
    downloadCanvasBlob,
} from '../lib/viewer-helpers.js';
import {
    type Plan3DCanvasHandle,
    type UsePlan3dSceneOptions,
} from '../types.js';

export type { Plan3DCanvasHandle };

export function usePlan3dScene(options: UsePlan3dSceneOptions): {
    readonly containerRef: React.RefObject<HTMLDivElement>;
    readonly canvasRef: React.RefObject<HTMLCanvasElement>;
    readonly roomLabels: readonly RoomLabelItem[];
} {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const walkRef = useRef<WalkController | null>(null);
    const [roomLabels, setRoomLabels] = useState<readonly RoomLabelItem[]>([]);

    useImperativeHandle(options.forwardRef, () => ({
        saveImage: () => {
            const [ren, sc] = [rendererRef.current, sceneRef.current];
            const [cam, can] = [cameraRef.current, canvasRef.current];
            if (ren && sc && cam && can) {
                ren.render(sc, cam);
                downloadCanvasBlob(can);
            }
        },
        walkInput: (input, isOn) => {
            walkRef.current?.setInput(input, isOn);
        },
    }));

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;
        const hintStair = options.onStairHint;

        const isLow = checkIsLowEnd();
        const renderer = createThreeRenderer(canvas, isLow);
        rendererRef.current = renderer;
        const [w, h] = [
            container.clientWidth || 800,
            container.clientHeight || 520,
        ];
        renderer.setSize(w, h);
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const lighting = setupLighting(scene, !isLow);
        lighting.setPreset(options.lightPreset);

        const { camera, controls } = setupCameraAndControls(canvas, w, h);
        cameraRef.current = camera;
        const sceneResult = buildScene(options.model, {
            materials: options.materials,
            maxFloorLevel: options.cutawayLevel ?? undefined,
            dollhouseFloorLevel: options.cutawayLevel,
            isCeilingVisible: options.cameraPreset === 'walk',
        });
        scene.add(sceneResult.scene);
        if (options.cameraPreset === 'walk') {
            controls.enabled = false;
            walkRef.current = createWalkController({
                camera,
                scene,
                canvas,
                model: options.model,
                level: options.walkLevel,
                onStairHint: hintStair,
            });
        } else {
            applyCameraPreset(
                camera,
                controls,
                sceneResult.bounds,
                options.cameraPreset,
            );
        }

        const updateView = (): void => {
            const labels =
                options.cutawayLevel !== null && options.isShowRoomNames
                    ? computeRoomLabels(
                          options.model,
                          options.cutawayLevel,
                          camera,
                          canvas,
                      )
                    : [];
            setRoomLabels(labels);
            sceneResult.updateCameraAzimuth?.(camera.position);
        };
        updateView();
        controls.addEventListener('change', updateView);

        const stopLoop = startViewerLoop({
            container,
            canvas,
            renderer,
            scene,
            camera,
            getWalk: () => walkRef.current,
            onTick: () => {
                controls.update();
            },
            onFrame: () => {
                sceneResult.updateCameraAzimuth?.(camera.position);
            },
            onResize: updateView,
        });

        return () => {
            walkRef.current?.dispose();
            walkRef.current = null;
            hintStair(null);
            stopLoop();
            controls.removeEventListener('change', updateView);
            teardownThreeResources(
                [lighting, controls, sceneResult, renderer],
                scene,
            );
        };
    }, [
        options.model,
        options.materials,
        options.cutawayLevel,
        options.isShowRoomNames,
        options.cameraPreset,
        options.walkLevel,
        options.onStairHint,
        options.lightPreset,
    ]);

    return { containerRef, canvasRef, roomLabels };
}
