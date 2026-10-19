import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import type {
    ConfigVersionMeta,
    ConfigAuditLogEntry,
} from '../types/admin-types';
import { VersionsTable } from './VersionsTable';
import { AuditLogsTable } from './AuditLogsTable';

type VersionHistoryPageProps = {
    readonly versions: readonly ConfigVersionMeta[];
    readonly auditLogs: readonly ConfigAuditLogEntry[];
    readonly currentPublishedVersion: number | null;
    readonly isLoading: boolean;
    readonly initialSubTab?: 'versions' | 'audit' | undefined;
    readonly onRefresh: () => void;
};

export function VersionHistoryPage({
    versions,
    auditLogs,
    currentPublishedVersion,
    isLoading,
    initialSubTab,
    onRefresh,
}: VersionHistoryPageProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const [subTab, setSubTab] = useState<'versions' | 'audit'>(
        initialSubTab ?? 'versions',
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {t('historyTitle')}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('historySubtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                            type="button"
                            onClick={() => {
                                setSubTab('versions');
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                subTab === 'versions'
                                    ? 'bg-white text-blue-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <History className="w-3.5 h-3.5 mr-1 inline" />
                            {t('tabVersions')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSubTab('audit');
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                subTab === 'audit'
                                    ? 'bg-white text-blue-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5 mr-1 inline" />
                            {t('tabAudit')}
                        </button>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`}
                        />
                        {t('refresh')}
                    </Button>
                </div>
            </div>

            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-6">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                        {subTab === 'versions'
                            ? t('tabVersions')
                            : t('tabAudit')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        {subTab === 'versions' ? (
                            <VersionsTable
                                versions={versions}
                                currentPublishedVersion={
                                    currentPublishedVersion
                                }
                            />
                        ) : (
                            <AuditLogsTable auditLogs={auditLogs} />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
