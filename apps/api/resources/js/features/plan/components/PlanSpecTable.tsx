import { useTranslation } from 'react-i18next';
import { type Plan } from '@aihome/planner';
import { boundingBox } from '@aihome/bdm';
import { Badge } from '@/shared/ui/Badge';
import {
    resolveStructure,
    resolveGrade,
    resolveInsulation,
    resolveSeismic,
    resolveRoof,
} from '../lib/plan-spec-resolvers';

type PlanSpecTableProps = {
    readonly plan: Plan;
    readonly answers?: Record<string, unknown> | undefined;
};

export function PlanSpecTable({
    plan,
    answers = {},
}: PlanSpecTableProps): React.JSX.Element {
    const { t } = useTranslation();
    const box = boundingBox(plan.model);

    const buildAreaM2 =
        Math.round((box.widthMm / 1000) * (box.depthMm / 1000) * 0.82 * 10) /
        10;
    const buildAreaTsubo = (buildAreaM2 / 3.305785).toFixed(1);

    const landTsubo =
        typeof answers.landTsubo === 'number' ? answers.landTsubo : 50;
    const landM2 = Math.round(landTsubo * 3.305785);

    const coverageLimit = 60;
    const floorRatioLimit = 200;
    const isCoverageOk = plan.summary.coveragePercent <= coverageLimit;
    const isFloorRatioOk = plan.summary.floorRatioPercent <= floorRatioLimit;

    const rows = [
        {
            label: t('plan:specTotalFloorArea'),
            val: `${plan.summary.floorAreaM2.toFixed(1)} m² (${plan.summary.tsubo.toFixed(1)} ${t('plan:tsubo')})`,
        },
        {
            label: t('plan:specBuildingArea'),
            val: `${buildAreaM2.toFixed(1)} m² (${buildAreaTsubo} ${t('plan:tsubo')})`,
        },
        {
            label: t('plan:specDimensions'),
            val: `${(box.widthMm / 1000).toFixed(2)}m × ${(box.depthMm / 1000).toFixed(2)}m`,
        },
        {
            label: t('plan:specFloorsCount'),
            val: `${plan.model.floors.length.toString()}${t('plan:specFloorsUnit')}`,
        },
        {
            label: t('plan:specStructure'),
            val: resolveStructure(answers.structure, t),
        },
        {
            label: t('plan:specRoofType'),
            val: resolveRoof(
                plan.model.exterior ? plan.model.roof.kind : answers.roofType,
                plan.model.roof.kind,
                t,
            ),
        },
        {
            label: t('plan:specLandArea'),
            val: `${landTsubo.toString()} ${t('plan:tsubo')} (${t('plan:areaApproxM2', { m2: landM2 })})`,
        },
        {
            label: t('plan:coverage'),
            val: `${plan.summary.coveragePercent.toString()}% / ${t('plan:limitLabel', { value: coverageLimit })}`,
            status: isCoverageOk ? 'success' : 'warn',
        },
        {
            label: t('plan:floorRatio'),
            val: `${plan.summary.floorRatioPercent.toString()}% / ${t('plan:limitLabel', { value: floorRatioLimit })}`,
            status: isFloorRatioOk ? 'success' : 'warn',
        },
        {
            label: t('plan:specGrade'),
            val: resolveGrade(answers.grade, t),
        },
        {
            label: t('plan:specInsulation'),
            val: resolveInsulation(answers.insulation, t),
        },
        {
            label: t('plan:specSeismic'),
            val: resolveSeismic(answers.seismic, t),
        },
    ];

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
                <tbody className="divide-y divide-slate-100">
                    {rows.map((row, idx) => (
                        <tr
                            key={row.label}
                            className={
                                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                            }
                        >
                            <th className="py-2.5 px-4 font-semibold text-slate-700 w-1/3">
                                {row.label}
                            </th>
                            <td className="py-2.5 px-4 text-slate-900 font-medium flex items-center justify-between">
                                <span>{row.val}</span>
                                {row.status ? (
                                    <Badge
                                        variant={
                                            row.status === 'success'
                                                ? 'success'
                                                : 'outline'
                                        }
                                        className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                                    >
                                        {row.status === 'success'
                                            ? t('plan:comparisonMatch')
                                            : t('plan:comparisonDiff')}
                                    </Badge>
                                ) : null}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
