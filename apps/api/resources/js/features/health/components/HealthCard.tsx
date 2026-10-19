import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/shared/i18n/error-message';
import type { HealthPayload } from '../schemas/health-schema';
import { HealthRow } from './HealthRow';
import { HealthSkeleton } from './HealthSkeleton';

type Props = {
    readonly data?: HealthPayload | undefined;
    readonly error?: unknown;
    readonly isLoading: boolean;
    readonly isError: boolean;
    readonly onRefresh: () => void;
};

export function HealthCard({
    data,
    error,
    isLoading,
    isError,
    onRefresh,
}: Props): React.JSX.Element {
    const { t } = useTranslation();

    if (isLoading) {
        return <HealthSkeleton />;
    }

    if (isError) {
        const errorMessage = getErrorMessage(error, t);
        return (
            <div className="p-5 bg-red-950/40 border border-red-500 rounded-lg text-red-200">
                <h2 className="text-base font-semibold mb-2 text-red-300">
                    {t('errors:title')}
                </h2>
                <p className="text-sm mb-4 text-red-200">{errorMessage}</p>
                <button
                    type="button"
                    onClick={onRefresh}
                    className="min-h-[44px] min-w-[44px] px-4 py-2 bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900 text-white font-medium text-sm rounded-md transition-colors cursor-pointer"
                >
                    {t('common:retry')}
                </button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 bg-slate-900 rounded-lg text-center text-slate-400">
                <p className="text-sm m-0">{t('common:noData')}</p>
            </div>
        );
    }

    const isApiOk = data.status === 'ok';
    const isDbUp = data.db === 'up';

    return (
        <div className="flex flex-col gap-3">
            <HealthRow
                label={t('health:apiStatus')}
                value={data.status}
                isSuccess={isApiOk}
            />
            <HealthRow
                label={t('health:database')}
                value={data.db}
                isSuccess={isDbUp}
            />
            <HealthRow
                label={t('health:serverUtcTime')}
                value={data.time}
                isMonospace
            />
            <div className="mt-2 flex justify-end">
                <button
                    type="button"
                    onClick={onRefresh}
                    className="min-h-[44px] min-w-[44px] px-4 py-2 bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 text-white font-medium text-sm rounded-md transition-colors cursor-pointer"
                >
                    {t('common:refresh')}
                </button>
            </div>
        </div>
    );
}
