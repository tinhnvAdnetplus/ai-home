import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import type { AdminNavTab } from '../types/admin-types';
import { isDemoMode } from '../api/admin-api';
import { parseAdminHash, formatAdminHash } from '../lib/admin-routing';
import { useAdminData } from '../hooks/useAdminData';
import { AdminLayout } from './AdminLayout';
import { DocumentListPage } from './DocumentListPage';
import { WizardEditorPage } from './WizardEditorPage';
import { VersionHistoryPage } from './VersionHistoryPage';
import { AiUsagePage } from './AiUsagePage';
import { AiSettingsPage } from './AiSettingsPage';
import { AdminProjectsPage } from './AdminProjectsPage';
import { ForbiddenView } from './ForbiddenView';

export type AdminPageProps = {
    readonly hash?: string | undefined;
};

export function AdminPage({
    hash: propHash,
}: AdminPageProps = {}): React.JSX.Element {
    const { t } = useTranslation('admin');
    const isDemo = isDemoMode();

    const currentHash =
        propHash ?? (typeof window !== 'undefined' ? window.location.hash : '');
    const routeState = parseAdminHash(currentHash);
    const activeTab = routeState.tab;

    const handleSelectTab = (tab: AdminNavTab) => {
        if (typeof window !== 'undefined') {
            window.location.hash = formatAdminHash(tab, isDemo);
        }
    };

    const {
        configsQuery,
        docQuery,
        versionsQuery,
        auditQuery,
        aiUsageQuery,
        isForbidden,
    } = useAdminData(activeTab);

    if (isForbidden) {
        return <ForbiddenView />;
    }

    if (configsQuery.isLoading && !isDemo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium">{t('loading')}</span>
            </div>
        );
    }

    const documents = configsQuery.data ?? [];
    const docDetail = docQuery.data ?? null;
    const versions = versionsQuery.data ?? [];
    const auditLogs = auditQuery.data ?? [];
    const aiUsage = aiUsageQuery.data ?? { recentCalls: [], dailyTotals: [] };

    return (
        <AdminLayout
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isDemo={isDemo}
        >
            {activeTab === 'configs' && (
                <DocumentListPage
                    documents={documents}
                    isLoading={configsQuery.isFetching}
                    onRefresh={() => void configsQuery.refetch()}
                    onSelectTab={handleSelectTab}
                />
            )}

            {activeTab === 'wizard' && (
                <WizardEditorPage
                    key={
                        docDetail
                            ? `${docDetail.key}-${docDetail.draftVersion?.payloadHash ?? docDetail.publishedVersion?.payloadHash ?? 'empty'}-${routeState.viewMode}-${routeState.dialog ?? 'none'}`
                            : 'loading'
                    }
                    documentDetail={docDetail}
                    versions={versions}
                    initialViewMode={routeState.viewMode}
                    initialDialog={routeState.dialog}
                    onReload={() => {
                        void docQuery.refetch();
                        void versionsQuery.refetch();
                        void configsQuery.refetch();
                    }}
                />
            )}

            {activeTab === 'versions' && (
                <VersionHistoryPage
                    key={routeState.subTab}
                    versions={versions}
                    auditLogs={auditLogs}
                    currentPublishedVersion={
                        docDetail?.publishedVersion?.version ?? null
                    }
                    isLoading={
                        versionsQuery.isFetching || auditQuery.isFetching
                    }
                    initialSubTab={routeState.subTab}
                    onRefresh={() => {
                        void versionsQuery.refetch();
                        void auditQuery.refetch();
                    }}
                />
            )}

            {activeTab === 'ai-settings' && <AiSettingsPage />}
            {activeTab === 'ai-usage' && <AiUsagePage usageData={aiUsage} />}
            {activeTab === 'projects' && <AdminProjectsPage />}
        </AdminLayout>
    );
}
