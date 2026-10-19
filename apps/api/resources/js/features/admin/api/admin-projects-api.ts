import type { AdminProjectsResponse } from '../types/admin-types';
import { demoAdminProjects } from '../fixtures/demo-projects-fixtures';
import { requestAdmin, isDemoMode } from './admin-http';
import { adminProjectsResponseSchema } from '../schemas/admin-project-schemas';

export async function fetchAdminProjects(
    params: {
        readonly status?: string | undefined;
        readonly page?: number | undefined;
        readonly perPage?: number | undefined;
    } = {},
): Promise<AdminProjectsResponse> {
    if (isDemoMode()) {
        if (params.status && params.status !== 'all') {
            const filtered = demoAdminProjects.data.filter(
                (p) => p.status === params.status,
            );
            return {
                data: filtered,
                meta: {
                    ...demoAdminProjects.meta,
                    total: filtered.length,
                },
            };
        }
        return demoAdminProjects;
    }

    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') {
        query.set('status', params.status);
    }
    if (params.page) {
        query.set('page', params.page.toString());
    }
    if (params.perPage) {
        query.set('per_page', params.perPage.toString());
    }

    const qs = query.toString();
    const endpoint = `/api/v1/admin/projects${qs ? `?${qs}` : ''}`;
    const raw = await requestAdmin(endpoint);
    return adminProjectsResponseSchema.parse(raw);
}
