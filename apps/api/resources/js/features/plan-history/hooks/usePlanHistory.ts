import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
    fetchProjects,
    PROJECTS_QUERY_KEY,
    type ProjectsResponse,
} from '@/features/projects';
import {
    groupPlanGenerations,
    type ProjectHistory,
} from '../lib/plan-generations';

const PER_PAGE = 20;

function isDevDemoActive(): boolean {
    if (!import.meta.env.DEV) return false;
    return /[?&]demo=1/.test(window.location.hash);
}

export interface UsePlanHistoryResult {
    readonly histories: readonly ProjectHistory[];
    readonly isLoading: boolean;
    readonly isError: boolean;
    readonly hasMore: boolean;
    readonly isLoadingMore: boolean;
    readonly loadMore: () => void;
    readonly refetch: () => void;
}

/** Every project of the user that has stored plans, each split into its generations. */
export function usePlanHistory(isEnabled: boolean): UsePlanHistoryResult {
    const isDemo = isDevDemoActive();

    const query = useInfiniteQuery<ProjectsResponse>({
        queryKey: [...PROJECTS_QUERY_KEY, 'history', isDemo],
        initialPageParam: 1,
        queryFn: async ({ pageParam, signal }) => {
            if (isDemo) {
                const { buildDemoProjects } =
                    await import('../lib/demo-project');
                return { data: buildDemoProjects() };
            }
            const page = typeof pageParam === 'number' ? pageParam : 1;
            return fetchProjects({ page, perPage: PER_PAGE }, signal);
        },
        getNextPageParam: (lastPage) => {
            const meta = lastPage.meta;
            return meta && meta.page < meta.last_page
                ? meta.page + 1
                : undefined;
        },
        enabled: isEnabled,
        staleTime: 60 * 1000,
    });

    const histories = useMemo(
        () =>
            (query.data?.pages ?? [])
                .flatMap((page) => page.data)
                .filter((project) => project.plans.length > 0)
                .map((project) => ({
                    project,
                    generations: groupPlanGenerations(project.plans),
                })),
        [query.data],
    );

    return {
        histories,
        isLoading: !isEnabled || query.isLoading,
        isError: query.isError,
        hasMore: query.hasNextPage,
        isLoadingMore: query.isFetchingNextPage,
        loadMore: () => {
            void query.fetchNextPage();
        },
        refetch: () => {
            void query.refetch();
        },
    };
}
