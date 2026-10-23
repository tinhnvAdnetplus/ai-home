import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Home } from 'lucide-react';
import { useRequireAuth, UserMenu } from '@/features/auth';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { usePlanHistory } from '../hooks/usePlanHistory';
import {
    buildHistoryHash,
    readSelectionFromHash,
    resolveSelection,
} from '../lib/history-selection';
import { HistorySidebar } from './HistorySidebar';
import { SavedPlanViewer } from './SavedPlanViewer';
import {
    HistoryEmptyState,
    HistoryErrorState,
    HistorySkeleton,
} from './HistoryStates';

export interface PlanHistoryPageProps {
    readonly hash: string;
}

export function PlanHistoryPage({
    hash,
}: PlanHistoryPageProps): React.JSX.Element {
    const { t } = useTranslation();
    const { isAuthenticated, isAuthLoading } = useRequireAuth('/history');
    const history = usePlanHistory(isAuthenticated && !isAuthLoading);

    const requested = useMemo(() => readSelectionFromHash(hash), [hash]);
    const selection = useMemo(
        () => resolveSelection(history.histories, requested),
        [history.histories, requested],
    );

    const handleSelect = (projectId: number, planId: number): void => {
        window.location.hash = buildHistoryHash(
            { projectId, planId },
            window.location.hash,
        );
        // Below lg the list sits under the viewer; bring the viewer back into view.
        if (window.matchMedia('(max-width: 1023px)').matches) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f4f9] text-foreground flex flex-col font-sans">
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <a
                        href="#/projects"
                        className="inline-flex items-center gap-2 text-base font-bold text-slate-900 hover:text-[#0b6bdc] transition-colors min-h-[44px]"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                            <Home className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span className="hidden sm:inline">
                            {t('common:appName')}
                        </span>
                    </a>
                    <div className="flex items-center gap-3">
                        <UserMenu />
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <a
                        href="#/projects"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0b6bdc] min-h-[44px]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('projects:backToProjects')}
                    </a>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        {t('projects:history.title')}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {t('projects:history.subtitle')}
                    </p>
                </div>

                {history.isLoading ? (
                    <HistorySkeleton />
                ) : history.isError ? (
                    <HistoryErrorState onRetry={history.refetch} />
                ) : selection === null ? (
                    <HistoryEmptyState />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <aside className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
                            <HistorySidebar
                                histories={history.histories}
                                selectedProjectId={selection.history.project.id}
                                selectedPlanId={selection.plan.id}
                                onSelect={handleSelect}
                                hasMore={history.hasMore}
                                isLoadingMore={history.isLoadingMore}
                                onLoadMore={history.loadMore}
                            />
                        </aside>
                        <section className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2 min-w-0">
                            <SavedPlanViewer selection={selection} />
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
