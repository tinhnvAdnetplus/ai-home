import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/lib/http';
import {
    fetchAdminConfigs,
    fetchAdminConfigDoc,
    fetchVersions,
    fetchAuditLogs,
    fetchAiUsage,
} from '../api/admin-api';

export function useAdminData(activeTab: string) {
    const configsQuery = useQuery({
        queryKey: ['admin', 'configs'],
        queryFn: fetchAdminConfigs,
    });

    const docQuery = useQuery({
        queryKey: ['admin', 'config', 'wizard'],
        queryFn: () => fetchAdminConfigDoc('wizard'),
        enabled:
            activeTab === 'wizard' ||
            activeTab === 'configs' ||
            activeTab === 'versions',
    });

    const versionsQuery = useQuery({
        queryKey: ['admin', 'versions', 'wizard'],
        queryFn: () => fetchVersions('wizard'),
        enabled: activeTab === 'versions' || activeTab === 'wizard',
    });

    const auditQuery = useQuery({
        queryKey: ['admin', 'audit', 'wizard'],
        queryFn: () => fetchAuditLogs('wizard'),
        enabled: activeTab === 'versions',
    });

    const aiUsageQuery = useQuery({
        queryKey: ['admin', 'ai-usage'],
        queryFn: fetchAiUsage,
        enabled: activeTab === 'ai-usage',
    });

    const isForbidden =
        (configsQuery.error instanceof ApiError &&
            configsQuery.error.status === 403) ||
        (docQuery.error instanceof ApiError && docQuery.error.status === 403) ||
        (aiUsageQuery.error instanceof ApiError &&
            aiUsageQuery.error.status === 403);

    return {
        configsQuery,
        docQuery,
        versionsQuery,
        auditQuery,
        aiUsageQuery,
        isForbidden,
    };
}
