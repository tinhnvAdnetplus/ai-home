import { useTranslation } from 'react-i18next';
import { AlertCircle, Box, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function HistorySkeleton(): React.JSX.Element {
    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            aria-hidden="true"
        >
            <div className="lg:col-span-4 xl:col-span-3 h-72 rounded-[24px] bg-white border border-slate-200/80 animate-pulse" />
            <div className="lg:col-span-8 xl:col-span-9 h-[520px] rounded-[24px] bg-white border border-slate-200/80 animate-pulse" />
        </div>
    );
}

export function HistoryErrorState({
    onRetry,
}: {
    readonly onRetry: () => void;
}): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="rounded-[24px] bg-white p-8 text-center shadow-sm border border-red-200/80 max-w-lg mx-auto my-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
                {t('projects:history.loadError')}
            </h2>
            <Button
                type="button"
                variant="outline"
                onClick={onRetry}
                className="min-h-[44px] mt-4 rounded-full border-slate-300"
            >
                <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>{t('common:retry')}</span>
            </Button>
        </div>
    );
}

export function HistoryEmptyState(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="rounded-[24px] bg-white p-8 sm:p-12 text-center shadow-sm border border-slate-200/80 max-w-lg mx-auto my-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0b6bdc] mb-4">
                <Box className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
                {t('projects:history.emptyTitle')}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
                {t('projects:history.emptyDescription')}
            </p>
            <Button
                type="button"
                onClick={() => {
                    window.location.hash = '#/wizard';
                }}
                className="min-h-[44px] rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white font-bold px-5"
            >
                <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                <span>{t('projects:createNew')}</span>
            </Button>
        </div>
    );
}
