import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Box, Compass, LayoutTemplate } from 'lucide-react';
import { LazyPlan3DViewer } from '@/features/plan3d';
import {
    FloorPlanView,
    PlanElevationsView,
    resolveMaterialsFromAnswers,
} from '@/features/plan';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import type { ResolvedSelection } from '../lib/history-selection';
import { SavedPlanHeader } from './SavedPlanHeader';

type ViewMode = '3d' | '2d' | 'elevations';

function isViewMode(val: string): val is ViewMode {
    return val === '3d' || val === '2d' || val === 'elevations';
}

export interface SavedPlanViewerProps {
    readonly selection: ResolvedSelection;
}

export function SavedPlanViewer({
    selection,
}: SavedPlanViewerProps): React.JSX.Element {
    const { t } = useTranslation();
    const [mode, setMode] = useState<ViewMode>('3d');
    const { history, plan } = selection;
    const model = plan.model;

    const materials = useMemo(
        () =>
            resolveMaterialsFromAnswers(
                history.project.answers ?? {},
                model?.exterior,
            ),
        [history.project.answers, model],
    );

    const tabs = [
        { id: '3d' as const, label: t('plan:view3d'), icon: Box },
        { id: '2d' as const, label: t('plan:view2d'), icon: LayoutTemplate },
        {
            id: 'elevations' as const,
            label: t('plan:viewElevations'),
            icon: Compass,
        },
    ];

    return (
        <div className="space-y-4 min-w-0">
            <SavedPlanHeader selection={selection} />

            {model ? (
                <>
                    <Tabs
                        value={mode}
                        onValueChange={(val) => {
                            if (isViewMode(val)) setMode(val);
                        }}
                    >
                        <TabsList className="grid grid-cols-3 w-full p-1 bg-slate-200/70 rounded-2xl border border-slate-200/80 h-auto gap-1">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <TabsTrigger
                                    key={id}
                                    value={id}
                                    className="flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-semibold min-w-0 min-h-[44px] data-[state=active]:bg-white data-[state=active]:text-[#0b6bdc] data-[state=active]:shadow-xs"
                                >
                                    <Icon
                                        className="h-3.5 w-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">{label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    {mode === '3d' ? (
                        <div className="h-[60vh] min-h-[380px] sm:h-[520px] lg:h-[640px] w-full rounded-[24px] overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
                            <LazyPlan3DViewer
                                key={plan.id}
                                model={model}
                                materials={materials}
                                fallback2DPlan={<FloorPlanView model={model} />}
                                className="h-full w-full"
                            />
                        </div>
                    ) : mode === '2d' ? (
                        <FloorPlanView
                            key={plan.id}
                            model={model}
                            planLabel={plan.label}
                        />
                    ) : (
                        <PlanElevationsView
                            model={model}
                            materials={materials}
                        />
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center gap-3 rounded-[24px] border border-amber-200 bg-amber-50/60 p-8 text-center">
                    <AlertTriangle
                        className="h-7 w-7 text-amber-600"
                        aria-hidden="true"
                    />
                    <h3 className="text-base font-bold text-slate-800">
                        {t('projects:history.invalidModelTitle')}
                    </h3>
                    <p className="max-w-md text-sm text-slate-600">
                        {t('projects:history.invalidModelDescription')}
                    </p>
                </div>
            )}
        </div>
    );
}
