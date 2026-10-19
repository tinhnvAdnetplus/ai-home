import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FolderKanban, Loader2 } from 'lucide-react';
import { fetchAdminProjects } from '../api/admin-projects-api';
import type { AdminProjectItem } from '../types/admin-types';
import { AdminProjectsFilters } from './AdminProjectsFilters';
import { AdminProjectsTable } from './AdminProjectsTable';
import { AdminProjectDetailModal } from './AdminProjectDetailModal';

export function AdminProjectsPage(): React.JSX.Element {
    const { t } = useTranslation('admin');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState<number>(1);
    const [selectedProject, setSelectedProject] =
        useState<AdminProjectItem | null>(null);

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin', 'projects', statusFilter, page],
        queryFn: () =>
            fetchAdminProjects({ status: statusFilter, page, perPage: 20 }),
    });

    const projects = data?.data ?? [];
    const meta = data?.meta ?? { page: 1, perPage: 20, total: 0, lastPage: 1 };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                            <FolderKanban className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            {t('adminProjectsTitle')}
                        </h1>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        {t('adminProjectsSubtitle')}
                    </p>
                </div>
            </div>

            <AdminProjectsFilters
                status={statusFilter}
                onStatusChange={(newStatus) => {
                    setStatusFilter(newStatus);
                    setPage(1);
                }}
                onRefresh={() => {
                    void refetch();
                }}
                isFetching={isFetching}
            />

            {isLoading ? (
                <div className="flex items-center justify-center p-12 text-slate-500 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm">{t('loading')}</span>
                </div>
            ) : (
                <AdminProjectsTable
                    projects={projects}
                    currentPage={meta.page}
                    lastPage={meta.lastPage}
                    total={meta.total}
                    onSelectProject={(project) => {
                        setSelectedProject(project);
                    }}
                    onPageChange={(newPage) => {
                        setPage(newPage);
                    }}
                />
            )}

            <AdminProjectDetailModal
                isOpen={selectedProject !== null}
                project={selectedProject}
                onClose={() => {
                    setSelectedProject(null);
                }}
            />
        </div>
    );
}
