import { useTranslation } from 'react-i18next';
import { type BuildingModel, type RoomType } from '@aihome/bdm';
import { localizeRoomName } from '../lib/room-names';

type PlanSpecRoomTableProps = {
    readonly model: BuildingModel;
};

type FloorFinishKey =
    | 'plan:finishTatami'
    | 'plan:finishWaterproof'
    | 'plan:finishTile'
    | 'plan:finishDeck'
    | 'plan:finishFlooring';

function getFloorFinishKey(type: RoomType): FloorFinishKey {
    if (type === 'washitsu') return 'plan:finishTatami';
    if (
        type === 'bath' ||
        type === 'toilet' ||
        type === 'wash' ||
        type === 'laundry'
    ) {
        return 'plan:finishWaterproof';
    }
    if (type === 'entrance' || type === 'porch') return 'plan:finishTile';
    if (type === 'deck') return 'plan:finishDeck';
    return 'plan:finishFlooring';
}

export function PlanSpecRoomTable({
    model,
}: PlanSpecRoomTableProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 w-full min-w-0">
            {model.floors.map((floor) => {
                const floorAreaM2 = floor.rooms
                    .filter(
                        (r) =>
                            r.type !== 'void' &&
                            r.type !== 'porch' &&
                            r.type !== 'deck' &&
                            r.type !== 'balcony',
                    )
                    .reduce((sum, r) => sum + r.areaM2, 0);
                const floorTsubo = (floorAreaM2 / 3.305785).toFixed(1);

                return (
                    <div key={floor.level} className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800">
                            <span>
                                {t('plan:floorFormat', { level: floor.level })}{' '}
                                <span className="font-normal text-slate-500 text-xs">
                                    {t('plan:floorAreaSummary', {
                                        m2: floorAreaM2.toFixed(1),
                                        tsubo: floorTsubo,
                                    })}
                                </span>
                            </span>
                            <span className="text-xs text-slate-400 font-normal">
                                {t('plan:roomCount', {
                                    count: floor.rooms.length,
                                })}
                            </span>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="py-2.5 px-3 font-semibold">
                                            {t('plan:roomTableName')}
                                        </th>
                                        <th className="py-2.5 px-3 font-semibold text-right w-20">
                                            {t('plan:roomTableJo')}
                                        </th>
                                        <th className="py-2.5 px-3 font-semibold text-right w-24">
                                            {t('plan:roomTableArea')}
                                        </th>
                                        <th className="py-2.5 px-3 font-semibold w-32">
                                            {t('plan:specFloorFinish')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {floor.rooms.map((room) => {
                                        const jo = (
                                            room.areaM2 / 1.65289
                                        ).toFixed(1);
                                        const finishKey = getFloorFinishKey(
                                            room.type,
                                        );
                                        return (
                                            <tr
                                                key={room.id}
                                                className="hover:bg-slate-50/50"
                                            >
                                                <td className="py-2 px-3 font-medium text-slate-800">
                                                    {localizeRoomName(
                                                        room.name,
                                                        t,
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-right font-semibold text-slate-700 whitespace-nowrap">
                                                    {jo} {t('plan:roomUnitJo')}
                                                </td>
                                                <td className="py-2 px-3 text-right text-slate-600 whitespace-nowrap">
                                                    {t('plan:areaM2', {
                                                        area: room.areaM2.toFixed(
                                                            1,
                                                        ),
                                                    })}
                                                </td>
                                                <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                                                    {t(finishKey)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-slate-50/70 border-t border-slate-200 text-xs font-bold text-slate-800">
                                    <tr>
                                        <td className="py-2.5 px-3">
                                            {t('plan:floorFormat', {
                                                level: floor.level,
                                            })}{' '}
                                            {t('plan:subtotal')}
                                        </td>
                                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                            {(floorAreaM2 / 1.65289).toFixed(1)}{' '}
                                            {t('plan:roomUnitJo')}
                                        </td>
                                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                            {t('plan:areaM2', {
                                                area: floorAreaM2.toFixed(1),
                                            })}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400 font-normal">
                                            —
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
