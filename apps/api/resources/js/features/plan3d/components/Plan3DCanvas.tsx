import { forwardRef } from 'react';
import { type BuildingModel } from '@aihome/bdm';
import { type MaterialOptions } from '@aihome/render3d';
import {
    usePlan3dScene,
    type Plan3DCanvasHandle,
} from '../hooks/usePlan3dScene.js';
import { type CameraPreset, type LightPreset } from '../types.js';
import { RoomLabelsOverlay } from './RoomLabelsOverlay.js';

export type { Plan3DCanvasHandle };

type Props = {
    readonly model: BuildingModel;
    readonly materials?: MaterialOptions | undefined;
    readonly cutawayLevel: number | null;
    readonly isShowRoomNames: boolean;
    readonly cameraPreset: CameraPreset;
    readonly walkLevel: number;
    readonly onStairHint: (targetLevel: number | null) => void;
    readonly lightPreset: LightPreset;
};

export const Plan3DCanvas = forwardRef<Plan3DCanvasHandle, Props>(
    function Plan3DCanvas(props, ref): React.JSX.Element {
        const { containerRef, canvasRef, roomLabels } = usePlan3dScene({
            ...props,
            forwardRef: ref,
        });

        return (
            <div
                ref={containerRef}
                className="w-full h-full relative overflow-hidden bg-slate-100 rounded-2xl"
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block touch-none"
                />
                <RoomLabelsOverlay
                    labels={roomLabels}
                    isVisible={
                        props.cutawayLevel !== null && props.isShowRoomNames
                    }
                />
            </div>
        );
    },
);
