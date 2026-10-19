import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, AlertCircle } from 'lucide-react';
import { generatePlansSafe, type SafePlanResult } from '@aihome/planner';
import { Button } from '@/shared/ui/Button';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { PLAN_PRESETS, type PresetKey } from '../data/sample-inputs';
import { PlanResults } from './PlanResults';

export function PlanDemoPage(): React.JSX.Element {
    const { t } = useTranslation();
    const [selectedPresetId, setSelectedPresetId] =
        useState<PresetKey>('preset-2');
    const [planResult, setPlanResult] = useState<SafePlanResult | null>(() => {
        const defaultPreset = PLAN_PRESETS[1] ?? PLAN_PRESETS[0];
        return defaultPreset ? generatePlansSafe(defaultPreset.input) : null;
    });
    const [isLoading, setIsLoading] = useState(false);

    const activePreset = useMemo(() => {
        return (
            PLAN_PRESETS.find((p) => p.id === selectedPresetId) ??
            PLAN_PRESETS[0]
        );
    }, [selectedPresetId]);

    const handleGenerate = useCallback(() => {
        if (!activePreset) return;
        setIsLoading(true);
        try {
            const res = generatePlansSafe(activePreset.input);
            setPlanResult(res);
        } finally {
            setIsLoading(false);
        }
    }, [activePreset]);

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
                            {t('plan:demoTitle')}
                        </span>
                    </div>
                    <LanguageSwitcher />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {t('plan:demoTitle')}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            {t('plan:demoSubtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-600 mr-1">
                                {t('plan:presetLabel')}:
                            </span>
                            {PLAN_PRESETS.map((preset) => {
                                const isSelected =
                                    preset.id === selectedPresetId;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedPresetId(preset.id);
                                        }}
                                        className={
                                            isSelected
                                                ? 'rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-xs min-h-[44px]'
                                                : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]'
                                        }
                                    >
                                        {t(`plan:${preset.titleKey}`)}
                                    </button>
                                );
                            })}
                        </div>

                        <Button
                            variant="default"
                            isLoading={isLoading}
                            onClick={handleGenerate}
                            className="gap-2 font-bold px-6 shadow-sm min-h-[44px]"
                        >
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            <span>{t('plan:generateButton')}</span>
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-slate-500 font-medium">
                        {t('plan:loading')}
                    </div>
                ) : planResult === null ? (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-base font-bold text-slate-700">
                            {t('plan:emptyTitle')}
                        </p>
                        <p className="text-sm mt-1">
                            {t('plan:emptyDescription')}
                        </p>
                    </div>
                ) : !planResult.ok ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
                        <div className="flex items-center gap-2 text-red-700 font-bold">
                            <AlertCircle
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                            <span>{t('plan:errorTitle')}</span>
                        </div>
                        <ul className="space-y-1 text-sm text-red-600 list-disc pl-5">
                            {planResult.issues.map((err) => (
                                <li key={`${err.code}-${err.message}`}>
                                    [{err.code}] {err.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <PlanResults plans={planResult.data.plans} />
                )}
            </main>
        </div>
    );
}
