import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { HealthCard, useHealth } from '@/features/health';
import { ErrorFallback } from '@/shared/ui/ErrorFallback';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';

function HealthContent(): React.JSX.Element {
    const { data, error, isLoading, isError, refetch } = useHealth();

    return (
        <HealthCard
            data={data}
            error={error}
            isLoading={isLoading}
            isError={isError}
            onRefresh={() => {
                void refetch();
            }}
        />
    );
}

export function AppShell(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6 font-sans">
            <section className="w-full max-w-xl bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
                <div className="flex justify-end mb-4">
                    <LanguageSwitcher />
                </div>

                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-sky-400 m-0">
                        {t('common:appName')}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {t('common:appSubtitle')}
                    </p>
                </header>

                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <HealthContent />
                </ErrorBoundary>

                <footer className="mt-8 pt-4 border-t border-slate-700 text-xs text-slate-500 text-center">
                    <span>{t('common:sameOriginNote')}</span>
                </footer>
            </section>
        </main>
    );
}
