import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LayoutTemplate,
    Box,
    Compass,
    Coins,
    Layers,
    ClipboardList,
} from 'lucide-react';
import { type BuildingModel } from '@aihome/bdm';
import { type MaterialOptions } from '@aihome/render3d';
import { type Plan } from '@aihome/planner';
import { LazyPlan3DViewer } from '@/features/plan3d';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { FloorPlanView, type FloorPlanViewHandle } from './FloorPlanView';
import { PlanElevationsView } from './PlanElevationsView';
import { PlanCostTab } from './PlanCostTab';
import { PlanSpecTab } from './PlanSpecTab';
import { PlanInputSummaryTab } from './PlanInputSummaryTab';

export type PlanViewMode =
    '2d' | '3d' | 'elevations' | 'cost' | 'spec' | 'inputSummary';

type PlanViewSwitcherProps = {
    readonly mode: PlanViewMode;
    readonly onModeChange: (mode: PlanViewMode) => void;
    readonly model: BuildingModel;
    readonly plan: Plan;
    readonly answers?: Record<string, unknown> | undefined;
    readonly materials?: MaterialOptions | undefined;
    readonly planLabel?: string | undefined;
    readonly onEditAnswers?: (() => void) | undefined;
};

function isPlanViewMode(val: string): val is PlanViewMode {
    return (
        val === '2d' ||
        val === '3d' ||
        val === 'elevations' ||
        val === 'cost' ||
        val === 'spec' ||
        val === 'inputSummary'
    );
}

export const PlanViewSwitcher = forwardRef<
    FloorPlanViewHandle,
    PlanViewSwitcherProps
>(function PlanViewSwitcher(
    {
        mode,
        onModeChange,
        model,
        plan,
        answers,
        materials,
        planLabel,
        onEditAnswers,
    },
    ref,
): React.JSX.Element {
    const { t } = useTranslation(['plan', 'common']);
    const tabsConfig = [
        { id: '2d' as const, label: t('plan:view2d'), icon: LayoutTemplate },
        { id: '3d' as const, label: t('plan:view3d'), icon: Box },
        {
            id: 'elevations' as const,
            label: t('plan:viewElevations'),
            icon: Compass,
        },
        { id: 'cost' as const, label: t('plan:tabCost'), icon: Coins },
        { id: 'spec' as const, label: t('plan:tabSpec'), icon: Layers },
        {
            id: 'inputSummary' as const,
            label: t('plan:tabInputSummary'),
            icon: ClipboardList,
        },
    ];

    return (
        <div className="space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between overflow-x-auto pb-1">
                <Tabs
                    value={mode}
                    onValueChange={(val) => {
                        if (isPlanViewMode(val)) onModeChange(val);
                    }}
                    className="w-full"
                >
                    <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full p-1 bg-slate-200/70 rounded-2xl border border-slate-200/80 min-w-0 h-auto gap-1">
                        {tabsConfig.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <TabsTrigger
                                    key={item.id}
                                    value={item.id}
                                    className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2 rounded-xl text-xs font-semibold min-w-0 min-h-[44px] data-[state=active]:bg-white data-[state=active]:text-[#0b6bdc] data-[state=active]:shadow-xs"
                                >
                                    <IconComponent
                                        className="h-3.5 w-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </Tabs>
            </div>

            <div className="w-full min-w-0">
                {mode === '2d' ? (
                    <FloorPlanView
                        ref={ref}
                        model={model}
                        planLabel={planLabel}
                    />
                ) : mode === '3d' ? (
                    <div className="h-[60vh] min-h-[380px] sm:h-[520px] lg:h-[640px] w-full rounded-[24px] overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
                        <LazyPlan3DViewer
                            model={model}
                            materials={materials}
                            className="h-full w-full"
                        />
                    </div>
                ) : mode === 'elevations' ? (
                    <PlanElevationsView model={model} materials={materials} />
                ) : mode === 'cost' ? (
                    <PlanCostTab plan={plan} answers={answers} />
                ) : mode === 'spec' ? (
                    <PlanSpecTab plan={plan} answers={answers} />
                ) : (
                    <PlanInputSummaryTab
                        answers={answers}
                        onEditAnswers={onEditAnswers}
                    />
                )}
            </div>
        </div>
    );
});

PlanViewSwitcher.displayName = 'PlanViewSwitcher';
