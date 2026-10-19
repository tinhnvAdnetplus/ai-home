import { apiClient } from '@/shared/api';
import {
    projectsResponseSchema,
    singleProjectResponseSchema,
    type CreateProjectInput,
    type Project,
    type ProjectsResponse,
    type UploadPlansInput,
} from '../schemas/project-schema';

export interface FetchProjectsParams {
    readonly status?: string | undefined;
    readonly page?: number | undefined;
    readonly perPage?: number | undefined;
}

export async function fetchProjects(
    params?: FetchProjectsParams,
    signal?: AbortSignal,
): Promise<ProjectsResponse> {
    const queryParams: Record<string, string | number> = {
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.page !== undefined ? { page: params.page } : {}),
        ...(params?.perPage !== undefined ? { per_page: params.perPage } : {}),
    };

    const raw = await apiClient('/api/v1/projects', {
        method: 'GET',
        ...(Object.keys(queryParams).length > 0 ? { params: queryParams } : {}),
        ...(signal ? { signal } : {}),
    });
    return projectsResponseSchema.parse(raw);
}

export async function fetchProject(
    id: number | string,
    signal?: AbortSignal,
): Promise<Project> {
    const raw = await apiClient(`/api/v1/projects/${String(id)}`, {
        method: 'GET',
        ...(signal ? { signal } : {}),
    });
    const parsed = singleProjectResponseSchema.parse(raw);
    return parsed.data;
}

export async function createProject(
    input?: CreateProjectInput,
): Promise<Project> {
    const raw = await apiClient('/api/v1/projects', {
        method: 'POST',
        body: input ?? {},
    });
    const parsed = singleProjectResponseSchema.parse(raw);
    return parsed.data;
}

export async function updateProject(
    id: number | string,
    input: {
        readonly title?: string | undefined;
        readonly status?: string | undefined;
    },
): Promise<Project> {
    const raw = await apiClient(`/api/v1/projects/${String(id)}`, {
        method: 'PATCH',
        body: input,
    });
    const parsed = singleProjectResponseSchema.parse(raw);
    return parsed.data;
}

export async function deleteProject(id: number | string): Promise<void> {
    await apiClient(`/api/v1/projects/${String(id)}`, {
        method: 'DELETE',
    });
}

export async function updateAnswers(
    id: number | string,
    answers: Record<string, unknown>,
): Promise<Project> {
    const raw = await apiClient(`/api/v1/projects/${String(id)}/answers`, {
        method: 'PUT',
        body: { answers },
    });
    const parsed = singleProjectResponseSchema.parse(raw);
    return parsed.data;
}

export async function submitProject(id: number | string): Promise<Project> {
    const raw = await apiClient(`/api/v1/projects/${String(id)}/submit`, {
        method: 'POST',
    });
    const parsed = singleProjectResponseSchema.parse(raw);
    return parsed.data;
}

export async function uploadPlans(
    id: number | string,
    plans: UploadPlansInput['plans'],
): Promise<unknown> {
    return apiClient(`/api/v1/projects/${String(id)}/plans`, {
        method: 'POST',
        body: { plans },
    });
}
