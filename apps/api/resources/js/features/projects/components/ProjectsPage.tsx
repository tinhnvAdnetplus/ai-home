import { clearAllStoredDrafts } from '@/features/wizard';
import { useTranslation } from 'react-i18next';
import { Plus, AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher';
import { useRequireAuth, UserMenu } from '@/features/auth';
import { useProjectsList } from '../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { ProjectsEmptyState } from './ProjectsEmptyState';

export function ProjectsPage(): React.JSX.Element {
    const { t } = useTranslation();
    const { isAuthLoading } = useRequireAuth('/projects');
    const {
        projects,
        isLoading: isProjectsLoading,
        isError,
        refetch,
        deleteProject,
        isDeleting,
    } = useProjectsList();

    const handleCreateNew = (): void => {
        clearAllStoredDrafts();
        window.location.hash = '#/wizard';
    };

    return (
        <div className="min-h-screen bg-[#f0f4f9] text-foreground flex flex-col font-sans">
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <a
                        href="#/"
                        className="inline-flex items-center gap-2 text-base font-bold text-slate-900 hover:text-[#0b6bdc] transition-colors min-h-[44px]"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#0b6bdc]">
                            <Home className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <span>{t('common:appName')}</span>
                    </a>

                    <div className="flex items-center gap-3">
                        <UserMenu />
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                            {t('projects:title')}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {t('projects:subtitle')}
                        </p>
                    </div>

                    <Button
                        type="button"
                        size="lg"
                        onClick={handleCreateNew}
                        className="min-h-[44px] rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white font-bold text-sm sm:text-base shadow-md px-5"
                    >
                        <Plus className="mr-1.5 h-5 w-5" aria-hidden="true" />
                        <span>{t('projects:createNew')}</span>
                    </Button>
                </div>

                {isProjectsLoading || isAuthLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div
                                key={n}
                                className="h-48 rounded-[24px] bg-white p-6 shadow-sm border border-slate-200/80 animate-pulse flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="h-5 w-20 bg-slate-200 rounded-full" />
                                    <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                                    <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
                                </div>
                                <div className="h-9 w-full bg-slate-100 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : null}

                {!isProjectsLoading && isError ? (
                    <div className="rounded-[24px] bg-white p-8 text-center shadow-sm border border-red-200/80 max-w-lg mx-auto my-12">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
                            <AlertCircle
                                className="h-6 w-6"
                                aria-hidden="true"
                            />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">
                            {t('projects:loadError')}
                        </h2>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                void refetch();
                            }}
                            className="min-h-[44px] mt-4 rounded-full border-slate-300"
                        >
                            <RefreshCw
                                className="mr-1.5 h-4 w-4"
                                aria-hidden="true"
                            />
                            <span>{t('common:retry')}</span>
                        </Button>
                    </div>
                ) : null}

                {!isProjectsLoading && !isError && projects.length === 0 ? (
                    <ProjectsEmptyState onCreateNew={handleCreateNew} />
                ) : null}

                {!isProjectsLoading && !isError && projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDelete={async (id) => {
                                    await deleteProject(id);
                                }}
                                isDeleting={isDeleting}
                            />
                        ))}
                    </div>
                ) : null}
            </main>

            <footer className="mt-auto border-t border-slate-200 bg-white/50 px-4 py-6 text-center text-xs text-slate-400">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>{t('common:appName')}</span>
                    <span className="text-slate-400">
                        {t('common:appSubtitle')}
                    </span>
                </div>
            </footer>
        </div>
    );
}
