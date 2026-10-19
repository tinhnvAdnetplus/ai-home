import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/ui/Badge';
import type { ConfigAuditLogEntry } from '../types/admin-types';

type AuditLogsTableProps = {
    readonly auditLogs: readonly ConfigAuditLogEntry[];
};

function getActionText(
    action: string,
    t: (
        key:
            | 'actionPublish'
            | 'actionDraftSave'
            | 'actionDiscard'
            | 'actionRollback',
    ) => string,
): string {
    if (action === 'publish') return t('actionPublish');
    if (action === 'draft_save') return t('actionDraftSave');
    if (action === 'discard') return t('actionDiscard');
    if (action === 'rollback') return t('actionRollback');
    return action;
}

export function AuditLogsTable({
    auditLogs,
}: AuditLogsTableProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                    <th className="py-3 px-6">{t('colTime')}</th>
                    <th className="py-3 px-6">{t('colAction')}</th>
                    <th className="py-3 px-6">{t('colVersion')}</th>
                    <th className="py-3 px-6">{t('colAuthor')}</th>
                    <th className="py-3 px-6">{t('colRequestId')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                    <tr>
                        <td
                            colSpan={5}
                            className="py-8 text-center text-slate-400"
                        >
                            {t('noData')}
                        </td>
                    </tr>
                ) : (
                    auditLogs.map((log) => (
                        <tr
                            key={log.id}
                            className="hover:bg-slate-50/80 transition-colors"
                        >
                            <td className="py-4 px-6 text-xs text-slate-600">
                                {log.createdAt
                                    ? new Date(log.createdAt).toLocaleString()
                                    : '-'}
                            </td>
                            <td className="py-4 px-6">
                                <Badge
                                    variant="secondary"
                                    className="text-xs font-medium"
                                >
                                    {getActionText(log.action, t)}
                                </Badge>
                            </td>
                            <td className="py-4 px-6 text-slate-700 font-semibold text-xs">
                                {log.version !== null
                                    ? `v${log.version.toString()}`
                                    : '-'}
                            </td>
                            <td className="py-4 px-6 text-slate-600 text-xs">
                                {log.user ? log.user.name : t('systemActor')}
                            </td>
                            <td className="py-4 px-6 text-slate-400 font-mono text-[11px] truncate max-w-xs">
                                {log.requestId ?? '-'}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
