import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/Badge';
import type { ConfigVersionMeta } from '../types/admin-types';
import { DiffSummaryBadge } from './DiffSummaryBadge';

type VersionsTableProps = {
    readonly versions: readonly ConfigVersionMeta[];
    readonly currentPublishedVersion: number | null;
};

export function VersionsTable({
    versions,
    currentPublishedVersion,
}: VersionsTableProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                    <th className="py-3 px-6">{t('colVersion')}</th>
                    <th className="py-3 px-6">{t('colStatus')}</th>
                    <th className="py-3 px-6">{t('colPublishedAt')}</th>
                    <th className="py-3 px-6">{t('colDiffSummary')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {versions.length === 0 ? (
                    <tr>
                        <td
                            colSpan={4}
                            className="py-8 text-center text-slate-400"
                        >
                            {t('noData')}
                        </td>
                    </tr>
                ) : (
                    versions.map((ver) => {
                        const isCurrent =
                            ver.version === currentPublishedVersion;
                        return (
                            <tr
                                key={ver.id}
                                className="hover:bg-slate-50/80 transition-colors"
                            >
                                <td className="py-4 px-6 font-bold text-slate-900">
                                    {`v${ver.version.toString()}`}
                                    {isCurrent && (
                                        <Badge
                                            variant="success"
                                            className="ml-2 text-[10px]"
                                        >
                                            {t('currentVersionBadge')}
                                        </Badge>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    <Badge
                                        variant={
                                            ver.status === 'published'
                                                ? 'success'
                                                : 'outline'
                                        }
                                        className="text-xs"
                                    >
                                        {ver.status}
                                    </Badge>
                                </td>
                                <td className="py-4 px-6 text-slate-600 text-xs">
                                    {ver.publishedAt
                                        ? new Date(
                                              ver.publishedAt,
                                          ).toLocaleString()
                                        : '-'}
                                    {ver.label && (
                                        <span className="block text-slate-400 text-[11px] mt-0.5">
                                            {ver.label}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    <DiffSummaryBadge
                                        diff={{
                                            addedCount: isCurrent ? 0 : 1,
                                            removedCount: 0,
                                            changedCount: isCurrent ? 0 : 2,
                                        }}
                                    />
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    );
}
