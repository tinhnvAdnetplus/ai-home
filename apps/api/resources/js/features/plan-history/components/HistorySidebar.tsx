import { useTranslation } from 'react-i18next';
import { Home, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import type { ProjectHistory } from '../lib/plan-generations';
import { HistoryGenerationRow } from './HistoryGenerationRow';

export interface HistorySidebarProps {
    readonly histories: readonly ProjectHistory[];
    readonly selectedProjectId: number | null;
    readonly selectedPlanId: number | null;
    readonly onSelect: (projectId: number, planId: number) => void;
    readonly hasMore: boolean;
    readonly isLoadingMore: boolean;
    readonly onLoadMore: () => void;
}

export function HistorySidebar({
    histories,
    selectedProjectId,
    selectedPlanId,
    onSelect,
    hasMore,
    isLoadingMore,
    onLoadMore,
}: HistorySidebarProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <nav
            aria-label={t('projects:history.projectsLabel')}
            className="space-y-4"
        >
            {histories.map(({ project, generations }) => {
                const isActive = project.id === selectedProjectId;
                return (
                    <section
                        key={project.id}
                        className={cn(
                            'rounded-[24px] border bg-white p-4 shadow-sm',
                            isActive
                                ? 'border-[#0b6bdc]/40'
                                : 'border-slate-200/80',
                        )}
                    >
                        <header className="mb-3 flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                                <Home className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-bold text-slate-900">
                                    {project.title ||
                                        t('projects:untitledProject')}
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    {t('projects:history.generationCount', {
                                        count: generations.length,
                                    })}
                                </p>
                            </div>
                        </header>

                        <ol className="space-y-4">
                            {generations.map((generation, i) => (
                                <HistoryGenerationRow
                                    key={generation.index}
                                    generation={generation}
                                    isLatest={i === 0}
                                    selectedPlanId={
                                        isActive ? selectedPlanId : null
                                    }
                                    onSelectPlan={(planId) => {
                                        onSelect(project.id, planId);
                                    }}
                                />
                            ))}
                        </ol>
                    </section>
                );
            })}

            {hasMore ? (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="min-h-[44px] w-full rounded-full border-slate-300"
                >
                    {isLoadingMore ? (
                        <Loader2
                            className="mr-1.5 h-4 w-4 animate-spin"
                            aria-hidden="true"
                        />
                    ) : null}
                    <span>{t('projects:history.loadMore')}</span>
                </Button>
            ) : null}
        </nav>
    );
}
