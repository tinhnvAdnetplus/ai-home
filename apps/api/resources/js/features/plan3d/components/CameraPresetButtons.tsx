import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';
import { type CameraPreset } from '../types.js';

type Props = {
    readonly cameraPreset: CameraPreset;
    readonly onSelectCamera: (preset: CameraPreset) => void;
};

export function CameraPresetButtons({
    cameraPreset,
    onSelectCamera,
}: Props): React.JSX.Element {
    const { t } = useTranslation();
    const btnBase =
        'px-2.5 py-1.5 min-h-[36px] sm:min-h-0 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5';
    const btnActive = 'bg-sky-600 text-white shadow-xs';
    const btnInactive =
        'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80';

    const presets: readonly {
        readonly id: CameraPreset;
        readonly label: string;
    }[] = [
        { id: 'exterior', label: t('plan3d:cameraExterior') },
        { id: 'birdeye', label: t('plan3d:cameraBirdEye') },
        { id: 'walk', label: t('plan3d:cameraWalk') },
    ];

    return (
        <div className="flex flex-wrap items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200/80 pointer-events-auto">
            <span className="text-slate-400 pl-1 text-xs sm:text-[11px] font-semibold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
            </span>
            {presets.map((p) => (
                <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                        onSelectCamera(p.id);
                    }}
                    className={`${btnBase} ${cameraPreset === p.id ? btnActive : btnInactive}`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}
