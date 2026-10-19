import type React from 'react';
import { type WalkInput } from './lib/walk-controller.js';
import { type BuildingModel } from '@aihome/bdm';
import { type MaterialOptions } from '@aihome/render3d';

export type CameraPreset = 'exterior' | 'birdeye' | 'walk';
export type LightPreset = 'day' | 'sunset';

export type Plan3DViewerProps = {
    readonly model: BuildingModel;
    readonly materials?: MaterialOptions | undefined;
    readonly fallback2DPlan?: React.ReactNode | undefined;
    readonly className?: string | undefined;
    readonly initialCutawayLevel?: number | null | undefined;
    readonly initialCameraPreset?: CameraPreset | undefined;
    readonly initialLightPreset?: LightPreset | undefined;
};

export type Plan3DCanvasHandle = {
    readonly saveImage: () => void;
    readonly walkInput: (input: WalkInput, isOn: boolean) => void;
};

export type UsePlan3dSceneOptions = {
    readonly model: BuildingModel;
    readonly materials?: MaterialOptions | undefined;
    readonly cutawayLevel: number | null;
    readonly isShowRoomNames: boolean;
    readonly cameraPreset: CameraPreset;
    readonly walkLevel: number;
    readonly onStairHint: (targetLevel: number | null) => void;
    readonly lightPreset: LightPreset;
    readonly forwardRef?: React.ForwardedRef<Plan3DCanvasHandle> | undefined;
};
