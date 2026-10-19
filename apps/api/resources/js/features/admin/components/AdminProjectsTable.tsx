import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import type { AdminProjectItem } from '../types/admin-types';
import { AdminProjectStatusBadge } from './AdminProjectStatusBadge';
import { AdminProjectsPagination } from './AdminProjectsPagination';

type AdminProjectsTableProps = {
    readonly projects: readonly AdminProjectItem[];
    readonly currentPage: number;
    readonly lastPage: number;
    readonly total: number;
    readonly onSelectProject: (project: AdminProjectItem) => void;
    readonly onPageChange: (page: number) => void;
};

export function AdminProjectsTable({
    projects,
    currentPage,
    lastPage,
    total,
    onSelectProject,
    onPageChange,
}: AdminProjectsTableProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                            <th className="py-3 px-4">{t('projectTitle')}</th>
                            <th className="py-3 px-4">{t('ownerEmail')}</th>
                            <th className="py-3 px-4">{t('status')}</th>
                            <th className="py-3 px-4">{t('configVersion')}</th>
                            <th className="py-3 px-4">{t('updatedAt')}</th>
                            <th className="py-3 px-4 text-center">
                                {t('planCount')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {projects.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="py-12 text-center text-slate-400"
                                >
                                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <span>{t('noProjectsFound')}</span>
                                </td>
                            </tr>
                        ) : (
                            projects.map((p) => (
                                <tr
                                    key={p.id}
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => {
                                        onSelectProject(p);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ')
                                            onSelectProject(p);
                                    }}
                                    className="hover:bg-blue-50/50 cursor-pointer transition-colors focus:bg-blue-50 focus:outline-none"
                                >
                                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                                        {p.title}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-slate-600">
                                        {p.user?.email ?? '—'}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <AdminProjectStatusBadge
                                            status={p.status}
                                        />
                                    </td>
                                    <td className="py-3.5 px-4 font-mono">
                                        {t('versionPrefix', {
                                            version: p.configVersion ?? 1,
                                        })}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                        {p.updatedAt
                                            ? new Date(
                                                  p.updatedAt,
                                              ).toLocaleString()
                                            : '—'}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
                                            {p.plans.length}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AdminProjectsPagination
                total={total}
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}
