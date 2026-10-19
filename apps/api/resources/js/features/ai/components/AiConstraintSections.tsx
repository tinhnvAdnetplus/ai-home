import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { type DesignConstraints } from '@aihome/planner';
import { localizeRoomName } from '@/features/plan';

const PRIORITY_KEYS = [
    { key: 'housework', labelKey: 'ai:priorityHousework' },
    { key: 'storage', labelKey: 'ai:priorityStorage' },
    { key: 'daylight', labelKey: 'ai:priorityDaylight' },
    { key: 'budget', labelKey: 'ai:priorityBudget' },
    { key: 'privacy', labelKey: 'ai:priorityPrivacy' },
    { key: 'family', labelKey: 'ai:priorityFamily' },
] as const;

type AiConstraintSectionsProps = {
    readonly constraints: DesignConstraints;
};

export function AiConstraintSections({
    constraints,
}: AiConstraintSectionsProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="space-y-3 text-xs sm:text-sm">
            <p className="rounded-xl bg-white/80 p-3 font-medium text-slate-800 border border-slate-100 shadow-2xs leading-relaxed">
                {constraints.summary}
            </p>

            <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">
                    {t('ai:priorityTitle')}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                    {PRIORITY_KEYS.map((p) => (
                        <span
                            key={p.key}
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200/80 shadow-2xs"
                        >
                            <span>{t(p.labelKey)}</span>
                            <span className="text-[#0b6bdc] font-bold">
                                {t('ai:priorityStar', {
                                    level: constraints.priorities[p.key],
                                })}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            {constraints.mustHaveRooms.length > 0 ? (
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">
                        {t('ai:mustHaveRoomsTitle')}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {constraints.mustHaveRooms.map((room) => (
                            <span
                                key={room}
                                className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-900 border border-emerald-200 break-words"
                            >
                                {localizeRoomName(room, t)}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {constraints.notes.length > 0 ? (
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">
                        {t('ai:notesTitle')}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {constraints.notes.map((note) => (
                            <span
                                key={note}
                                className="rounded-md bg-blue-50/80 px-2 py-0.5 text-xs text-blue-900 border border-blue-200/60 break-words"
                            >
                                {note}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {constraints.unmappedRequests.length > 0 ? (
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        {t('ai:unmappedRequestsTitle')}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {constraints.unmappedRequests.map((req) => (
                            <span
                                key={req}
                                className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-900 border border-amber-200 break-words"
                            >
                                {req}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
