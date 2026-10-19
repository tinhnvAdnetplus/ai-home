import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchProjects,
    fetchProject,
    deleteProject as apiDeleteProject,
    createProject as apiCreateProject,
    type FetchProjectsParams,
} from '../api/projects-api';
import type { Project, ProjectsResponse } from '../schemas/project-schema';

export const PROJECTS_QUERY_KEY = ['projects'] as const;

const DEMO_PROJECTS: readonly Project[] = [
    {
        id: 101,
        user_id: 1,
        title: '世田谷区 2階建てモダン住宅',
        status: 'submitted',
        config_version: 1,
        answers: {},
        submitted_at: '2026-10-10T10:00:00Z',
        created_at: '2026-10-09T08:30:00Z',
        updated_at: '2026-10-10T10:00:00Z',
        deleted_at: null,
        plans: [
            {
                id: 1,
                project_id: 101,
                label: 'プランA',
                score: { total: 88 },
                model: {},
                created_at: '2026-10-10T10:00:00Z',
                updated_at: '2026-10-10T10:00:00Z',
            },
        ],
    },
    {
        id: 102,
        user_id: 1,
        title: '鎌倉市 自然素材の平屋プラン',
        status: 'draft',
        config_version: 1,
        answers: {},
        submitted_at: null,
        created_at: '2026-10-12T14:20:00Z',
        updated_at: '2026-10-12T14:20:00Z',
        deleted_at: null,
        plans: [],
    },
];

export function useProjectsList(params?: FetchProjectsParams) {
    const queryClient = useQueryClient();

    const isDevDemo =
        import.meta.env.DEV &&
        typeof window !== 'undefined' &&
        /[?&]demo=1/.test(window.location.hash);

    const query = useQuery<ProjectsResponse>({
        queryKey: [...PROJECTS_QUERY_KEY, params],
        queryFn: ({ signal }) => fetchProjects(params, signal),
        staleTime: 60 * 1000,
        enabled: !isDevDemo,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number | string) => apiDeleteProject(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: PROJECTS_QUERY_KEY,
            });
        },
    });

    return {
        projects: isDevDemo ? DEMO_PROJECTS : (query.data?.data ?? []),
        meta: query.data?.meta,
        isLoading: isDevDemo ? false : query.isLoading,
        isError: isDevDemo ? false : query.isError,
        error: query.error,
        refetch: query.refetch,
        deleteProject: async (id: number | string) =>
            deleteMutation.mutateAsync(id),
        isDeleting: deleteMutation.isPending,
    };
}

export function useProject(id: number | string | null) {
    const isEnabled = id !== null && id !== '' && !Number.isNaN(Number(id));

    return useQuery<Project>({
        queryKey: [...PROJECTS_QUERY_KEY, 'detail', id],
        queryFn: ({ signal }) => {
            if (!isEnabled) {
                throw new Error('Invalid project ID');
            }
            return fetchProject(id, signal);
        },
        enabled: isEnabled,
        staleTime: 60 * 1000,
        retry: 1,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: apiCreateProject,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: PROJECTS_QUERY_KEY,
            });
        },
    });
}
