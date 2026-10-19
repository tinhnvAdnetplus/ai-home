import { useTranslation } from 'react-i18next';
import {
    Sun,
    Moon,
    Layers,
    Download,
    Maximize2,
    Minimize2,
    Tag,
} from 'lucide-react';
import { type CameraPreset, type LightPreset } from '../types.js';
import { CameraPresetButtons } from './CameraPresetButtons.js';

type Props = {
    readonly totalFloors: number;
    readonly cutawayLevel: number | null;
    readonly isShowRoomNames: boolean;
    readonly cameraPreset: CameraPreset;
    readonly lightPreset: LightPreset;
    readonly isFullscreen: boolean;
    readonly onSelectCutaway: (level: number | null) => void;
    readonly onToggleRoomNames: () => void;
    readonly onSelectCamera: (preset: CameraPreset) => void;
    readonly onSelectLight: (preset: LightPreset) => void;
    readonly onSaveImage: () => void;
    readonly onToggleFullscreen: () => void;
};

export function ViewerControls(props: Props): React.JSX.Element {
    const { t } = useTranslation();
    const floorLevels = Array.from(
        { length: props.totalFloors },
        (_, i) => i + 1,
    );

    const btnBase =
        'px-2.5 py-1.5 min-h-[36px] sm:min-h-0 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5';
    const btnActive = 'bg-sky-600 text-white shadow-xs';
    const btnInactive =
        'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80';

    return (
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
            <div className="flex flex-wrap items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200/80 pointer-events-auto">
                <span className="text-slate-400 pl-1 text-xs sm:text-[11px] font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                </span>
                {props.cameraPreset !== 'birdeye' &&
                    props.cameraPreset !== 'walk' && (
                        <button
                            type="button"
                            onClick={() => {
                                props.onSelectCutaway(null);
                            }}
                            className={`${btnBase} ${props.cutawayLevel === null ? btnActive : btnInactive}`}
                            aria-pressed={props.cutawayLevel === null}
                        >
                            {t('plan3d:floorAll')}
                        </button>
                    )}
                {floorLevels.map((lvl) => (
                    <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                            props.onSelectCutaway(lvl);
                        }}
                        className={`${btnBase} ${props.cutawayLevel === lvl ? btnActive : btnInactive}`}
                        aria-pressed={props.cutawayLevel === lvl}
                    >
                        {t('plan3d:floorCut', { level: lvl })}
                    </button>
                ))}
                {props.cutawayLevel !== null &&
                    props.cameraPreset !== 'walk' && (
                        <button
                            type="button"
                            onClick={props.onToggleRoomNames}
                            className={`${btnBase} ${props.isShowRoomNames ? btnActive : btnInactive}`}
                            title={t('plan3d:roomNames')}
                            aria-pressed={props.isShowRoomNames}
                        >
                            <Tag className="w-3.5 h-3.5" />
                            <span>{t('plan3d:roomNames')}</span>
                        </button>
                    )}
            </div>

            <CameraPresetButtons
                cameraPreset={props.cameraPreset}
                onSelectCamera={props.onSelectCamera}
            />

            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200/80 pointer-events-auto">
                <button
                    type="button"
                    onClick={() => {
                        props.onSelectLight(
                            props.lightPreset === 'day' ? 'sunset' : 'day',
                        );
                    }}
                    className={`${btnBase} ${btnInactive}`}
                    title={t('plan3d:lightPreset')}
                    aria-label={t('plan3d:lightPreset')}
                >
                    {props.lightPreset === 'day' ? (
                        <>
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            <span>{t('plan3d:lightDay')}</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{t('plan3d:lightSunset')}</span>
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={props.onSaveImage}
                    className={`${btnBase} ${btnInactive}`}
                    title={t('plan3d:saveImage')}
                    aria-label={t('plan3d:saveImage')}
                >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden sm:inline">
                        {t('plan3d:saveImage')}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={props.onToggleFullscreen}
                    className={`${btnBase} ${btnInactive}`}
                    title={
                        props.isFullscreen
                            ? t('plan3d:exitFullscreen')
                            : t('plan3d:fullscreen')
                    }
                    aria-label={
                        props.isFullscreen
                            ? t('plan3d:exitFullscreen')
                            : t('plan3d:fullscreen')
                    }
                >
                    {props.isFullscreen ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}
