import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePlansSafe, type Plan } from '@aihome/planner';
import { PLAN_PRESETS, FloorPlanView } from '@/features/plan';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { parseDemoQueryParams } from '../lib/viewer-helpers.js';
import { LazyPlan3DViewer } from './LazyPlan3DViewer.js';
import { MaterialColorPicker } from './MaterialColorPicker.js';

export function Plan3dDemoPage(): React.JSX.Element {
    const { t } = useTranslation();
    const init = useMemo(() => parseDemoQueryParams(), []);
    const [presetId, setPresetId] = useState<string>(init.presetId);
    const [activeVariant, setActiveVariant] = useState<'A' | 'B' | 'C'>('A');
    const [wallColor, setWallColor] = useState<string>('#f4f3ef');
    const [roofColor, setRoofColor] = useState<string>('#37415a');
    const [floorColor, setFloorColor] = useState<string>('#c9a678');

    const currentPreset = useMemo(
        () => PLAN_PRESETS.find((p) => p.id === presetId) ?? PLAN_PRESETS[0],
        [presetId],
    );
    const safeResult = useMemo(
        () => (currentPreset ? generatePlansSafe(currentPreset.input) : null),
        [currentPreset],
    );
    const activePlan: Plan | null = useMemo(() => {
        if (!safeResult?.ok) return null;
        const [p0, p1, p2] = safeResult.data.plans;
        return activeVariant === 'B' ? p1 : activeVariant === 'C' ? p2 : p0;
    }, [safeResult, activeVariant]);

    const variants = [
        { key: 'A', label: t('plan:planA') },
        { key: 'B', label: t('plan:planB') },
        { key: 'C', label: t('plan:planC') },
    ] as const;

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-16 font-sans">
            <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base sm:text-lg text-primary tracking-tight">
                            {t('common:appName')}
                        </span>
                        <span
                            className="inline-block w-px h-3.5 bg-slate-300"
                            aria-hidden="true"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-slate-700">
                            {t('plan3d:title')}
                        </span>
                    </div>
                    <LanguageSwitcher />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-slate-900">
                                {t('plan3d:title')}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {t('plan3d:subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {PLAN_PRESETS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        setPresetId(p.id);
                                    }}
                                    className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-lg border transition-colors ${
                                        presetId === p.id
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {t(`plan:${p.titleKey}` as const)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-500 mr-1">
                                {t('plan3d:proposalSwitch')}:
                            </span>
                            {variants.map((v) => (
                                <button
                                    key={v.key}
                                    type="button"
                                    onClick={() => {
                                        setActiveVariant(v.key);
                                    }}
                                    className={`px-3 py-1 min-h-[44px] sm:min-h-0 text-xs font-bold rounded-lg border transition-colors ${
                                        activeVariant === v.key
                                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>

                        <MaterialColorPicker
                            wallColor={wallColor}
                            roofColor={roofColor}
                            floorColor={floorColor}
                            onChangeWall={setWallColor}
                            onChangeRoof={setRoofColor}
                            onChangeFloor={setFloorColor}
                        />
                    </div>
                </div>

                {activePlan ? (
                    <LazyPlan3DViewer
                        model={activePlan.model}
                        materials={{
                            wall: wallColor,
                            roof: roofColor,
                            floor: floorColor,
                        }}
                        initialCutawayLevel={init.cutawayLevel}
                        initialCameraPreset={init.cameraPreset}
                        initialLightPreset={init.lightPreset}
                        fallback2DPlan={
                            <FloorPlanView model={activePlan.model} />
                        }
                    />
                ) : (
                    <div className="h-[400px] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
                        <span className="text-sm text-slate-400">
                            {t('plan:loading')}
                        </span>
                    </div>
                )}
            </main>
        </div>
    );
}
