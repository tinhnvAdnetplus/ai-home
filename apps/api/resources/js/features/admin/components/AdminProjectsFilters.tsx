import { useTranslation } from 'react-i18next';
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

type AdminProjectsFiltersProps = {
    readonly status: string;
    readonly onStatusChange: (status: string) => void;
    readonly onRefresh: () => void;
    readonly isFetching: boolean;
};

export function AdminProjectsFilters({
    status,
    onStatusChange,
    onRefresh,
    isFetching,
}: AdminProjectsFiltersProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">
                    {t('filterStatus')}:
                </span>
                <select
                    value={status}
                    onChange={(e) => {
                        onStatusChange(e.target.value);
                    }}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">{t('statusAll')}</option>
                    <option value="draft">{t('statusDraft')}</option>
                    <option value="submitted">{t('statusSubmitted')}</option>
                    <option value="completed">{t('statusCompleted')}</option>
                    <option value="archived">{t('statusArchived')}</option>
                </select>
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isFetching}
                className="text-xs flex items-center gap-1.5 self-end sm:self-auto"
            >
                <RefreshCw
                    className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
                />
                <span>{t('refresh')}</span>
            </Button>
        </div>
    );
}
