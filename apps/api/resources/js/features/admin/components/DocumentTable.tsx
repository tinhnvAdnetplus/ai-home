import { useTranslation } from 'react-i18next';
import { FileEdit, History } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import type { ConfigDocumentSummary, AdminNavTab } from '../types/admin-types';

type DocumentTableProps = {
    readonly documents: readonly ConfigDocumentSummary[];
    readonly onSelectTab: (tab: AdminNavTab) => void;
};

export function DocumentTable({
    documents,
    onSelectTab,
}: DocumentTableProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                        <th className="py-3 px-6">{t('colKey')}</th>
                        <th className="py-3 px-6">{t('colScope')}</th>
                        <th className="py-3 px-6">
                            {t('colPublishedVersion')}
                        </th>
                        <th className="py-3 px-6">{t('colDraftStatus')}</th>
                        <th className="py-3 px-6 text-right">
                            {t('colActions')}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {documents.length === 0 ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="py-8 text-center text-slate-400"
                            >
                                {t('noData')}
                            </td>
                        </tr>
                    ) : (
                        documents.map((doc) => (
                            <tr
                                key={doc.key}
                                className="hover:bg-slate-50/80 transition-colors"
                            >
                                <td className="py-4 px-6 font-semibold text-slate-900">
                                    {doc.key}
                                </td>
                                <td className="py-4 px-6 text-slate-600">
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {doc.scope}
                                    </Badge>
                                </td>
                                <td className="py-4 px-6">
                                    {doc.currentPublishedVersion !== null ? (
                                        <Badge
                                            variant="success"
                                            className="text-xs"
                                        >
                                            {t('publishedBadge', {
                                                version:
                                                    doc.currentPublishedVersion.toString(),
                                            })}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-slate-400">
                                            {t('notPublished')}
                                        </span>
                                    )}
                                    {doc.publishedAt && (
                                        <span className="block text-[11px] text-slate-400 mt-0.5">
                                            {new Date(
                                                doc.publishedAt,
                                            ).toLocaleString()}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    {doc.hasDraft ? (
                                        <Badge
                                            variant="warning"
                                            className="text-xs"
                                        >
                                            {t('hasDraft')}
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-xs text-slate-400 border-slate-200"
                                        >
                                            {t('noDraft')}
                                        </Badge>
                                    )}
                                    {doc.draftUpdatedAt && (
                                        <span className="block text-[11px] text-slate-400 mt-0.5">
                                            {new Date(
                                                doc.draftUpdatedAt,
                                            ).toLocaleString()}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                onSelectTab('wizard');
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <FileEdit className="w-3.5 h-3.5 mr-1" />
                                            {t('editWizard')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                onSelectTab('versions');
                                            }}
                                        >
                                            <History className="w-3.5 h-3.5 mr-1" />
                                            {t('viewVersions')}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
