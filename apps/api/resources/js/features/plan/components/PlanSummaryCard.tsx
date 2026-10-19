import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { type PlanSummary, type Plan } from '@aihome/planner';
import { type BuildingModel } from '@aihome/bdm';
import { localizeRoomName } from '../lib/room-names';
import { calculatePlanCost } from '../lib/plan-cost';

type PlanSummaryCardProps = {
    readonly summary: PlanSummary;
    readonly model: BuildingModel;
    readonly plan?: Plan | undefined;
    readonly answers?: Record<string, unknown> | undefined;
};

type RoomTableRow = {
    readonly id: string;
    readonly name: string;
    readonly floorLevel: number;
    readonly areaM2: number;
    readonly jo: number;
};

export function PlanSummaryCard({
    summary,
    model,
    plan,
    answers = {},
}: PlanSummaryCardProps): React.JSX.Element {
    const { t } = useTranslation();

    const costResult = useMemo(() => {
        if (!plan) return null;
        return calculatePlanCost(plan, answers);
    }, [plan, answers]);

    const rooms: readonly RoomTableRow[] = model.floors.flatMap((f) =>
        f.rooms.map((r) => ({
            id: r.id,
            name: r.name,
            floorLevel: f.level,
            areaM2: r.areaM2,
            jo: Math.round((r.areaM2 / 1.65289) * 10) / 10,
        })),
    );

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4 w-full min-w-0">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0b6bdc]">
                    <Home className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('plan:summaryTitle')}
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-2.5">
                    <span className="text-xs sm:text-[11px] text-slate-500 block">
                        {t('plan:floorArea')}
                    </span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                        {summary.floorAreaM2.toString()} {t('plan:unitM2')}
                    </span>
                    <span className="text-xs sm:text-[11px] text-slate-400">
                        ({summary.tsubo.toString()} {t('plan:tsubo')})
                    </span>
                </div>
                <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-2.5">
                    <span className="text-xs sm:text-[11px] text-slate-500 block">
                        {t('plan:coverage')} / {t('plan:floorRatio')}
                    </span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                        {summary.coveragePercent.toString()}% /{' '}
                        {summary.floorRatioPercent.toString()}%
                    </span>
                    <span className="text-xs sm:text-[11px] text-slate-400">
                        {t('plan:limitLabel', { value: 60 })}
                    </span>
                </div>
                {costResult ? (
                    <div className="col-span-2 rounded-2xl bg-slate-50/80 border border-slate-100 p-2.5 flex items-center justify-between">
                        <div>
                            <span className="text-xs sm:text-[11px] text-slate-500 block">
                                {t('plan:costRoughEstimateLabel')}
                            </span>
                            <span className="text-sm font-bold text-slate-900 block mt-0.5">
                                {costResult.total.toLocaleString()}{' '}
                                {t('plan:unitManYen')}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400">
                            {costResult.unitPrice.toString()}{' '}
                            {t('plan:unitManYen')}/{t('plan:tsubo')}
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{t('plan:roomsListTitle')}</span>
                    <span className="text-xs sm:text-[11px] text-slate-400 font-normal">
                        {t('plan:roomCount', { count: rooms.length })}
                    </span>
                </div>

                <div className="max-h-52 overflow-y-auto overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 text-xs sm:text-[11px]">
                            <tr>
                                <th className="py-1.5 px-2 font-medium w-10">
                                    {t('plan:roomTableFloor')}
                                </th>
                                <th className="py-1.5 px-2 font-medium">
                                    {t('plan:roomTableName')}
                                </th>
                                <th className="py-1.5 px-2 font-medium text-right w-16">
                                    {t('plan:roomTableJo')}
                                </th>
                                <th className="py-1.5 px-2 font-medium text-right w-16">
                                    {t('plan:roomTableArea')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rooms.map((room) => (
                                <tr
                                    key={room.id}
                                    className="hover:bg-blue-50/30 transition-colors"
                                >
                                    <td className="py-1.5 px-2 text-slate-400 font-medium">
                                        {t('plan:floorFormat', {
                                            level: room.floorLevel,
                                        })}
                                    </td>
                                    <td className="py-1.5 px-2 font-semibold text-slate-800 truncate max-w-[120px]">
                                        {localizeRoomName(room.name, t)}
                                    </td>
                                    <td className="py-1.5 px-2 text-right font-medium text-slate-700 whitespace-nowrap">
                                        {room.jo.toFixed(1)}{' '}
                                        {t('plan:roomUnitJo')}
                                    </td>
                                    <td className="py-1.5 px-2 text-right text-slate-500 whitespace-nowrap">
                                        {room.areaM2.toFixed(1)}{' '}
                                        {t('plan:unitM2')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
