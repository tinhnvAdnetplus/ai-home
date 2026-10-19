import { useTranslation } from 'react-i18next';
import { Layers, FileSpreadsheet } from 'lucide-react';
import { type Plan } from '@aihome/planner';
import { PlanSpecTable } from './PlanSpecTable';
import { PlanSpecRoomTable } from './PlanSpecRoomTable';

type PlanSpecTabProps = {
    readonly plan: Plan;
    readonly answers?: Record<string, unknown> | undefined;
};

export function PlanSpecTab({
    plan,
    answers = {},
}: PlanSpecTabProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 w-full min-w-0">
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                        <Layers className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            {t('plan:specOverviewTitle')}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {t('plan:specOverviewSubtitle')}
                        </p>
                    </div>
                </div>

                <PlanSpecTable plan={plan} answers={answers} />
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                        <FileSpreadsheet
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {t('plan:specRoomTableTitle')}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {t('plan:specRoomTableSubtitle')}
                        </p>
                    </div>
                </div>

                <PlanSpecRoomTable model={plan.model} />
            </div>
        </div>
    );
}
