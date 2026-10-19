import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/Badge';
import type { DiffSummary } from '../types/admin-types';

type DiffSummaryBadgeProps = {
    readonly diff: DiffSummary;
};

export function DiffSummaryBadge({
    diff,
}: DiffSummaryBadgeProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const { addedCount, removedCount, changedCount } = diff;

    if (addedCount === 0 && removedCount === 0 && changedCount === 0) {
        return (
            <Badge
                variant="outline"
                className="text-slate-400 border-slate-200 text-xs"
            >
                {t('diffUnchanged')}
            </Badge>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {addedCount > 0 && (
                <Badge variant="success" className="text-[11px] py-0 px-1.5">
                    {t('diffAdded', { count: addedCount.toString() })}
                </Badge>
            )}
            {removedCount > 0 && (
                <Badge
                    variant="destructive"
                    className="text-[11px] py-0 px-1.5"
                >
                    {t('diffRemoved', { count: removedCount.toString() })}
                </Badge>
            )}
            {changedCount > 0 && (
                <Badge
                    variant="secondary"
                    className="text-[11px] py-0 px-1.5 bg-blue-50 text-blue-700 border-blue-200"
                >
                    {t('diffChanged', { count: changedCount.toString() })}
                </Badge>
            )}
        </div>
    );
}
