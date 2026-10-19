import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, login, logout, register } from '../api/auth-api';
import type { LoginInput, RegisterInput, User } from '../schemas/auth-schema';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export type UseSessionResult = {
    readonly user: User | null;
    readonly isLoading: boolean;
    readonly isAuthenticated: boolean;
    readonly login: (input: LoginInput) => Promise<User>;
    readonly register: (input: RegisterInput) => Promise<User>;
    readonly logout: () => Promise<void>;
    readonly isLoggingIn: boolean;
    readonly isRegistering: boolean;
    readonly isLoggingOut: boolean;
    readonly refetchUser: () => Promise<void>;
};

export function useSession(): UseSessionResult {
    const queryClient = useQueryClient();

    const {
        data: user = null,
        isLoading,
        refetch,
    } = useQuery<User | null>({
        queryKey: AUTH_QUERY_KEY,
        queryFn: ({ signal }) => fetchCurrentUser(signal),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            queryClient.setQueryData<User | null>(AUTH_QUERY_KEY, data);
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: (data) => {
            queryClient.setQueryData<User | null>(AUTH_QUERY_KEY, data);
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            queryClient.setQueryData<User | null>(AUTH_QUERY_KEY, null);
            queryClient.removeQueries({ queryKey: ['projects'] });
        },
    });

    const devDemoUser: User | null =
        import.meta.env.DEV &&
        typeof window !== 'undefined' &&
        /[?&]demo=1/.test(window.location.hash)
            ? {
                  id: 1,
                  name: '山田 太郎',
                  email: 'user@aihome.local',
                  role: 'user',
                  abilities: [],
              }
            : null;

    const currentUser = devDemoUser ?? user;

    return {
        user: currentUser,
        isLoading: devDemoUser !== null ? false : isLoading,
        isAuthenticated: currentUser !== null,
        login: async (input: LoginInput) => loginMutation.mutateAsync(input),
        register: async (input: RegisterInput) =>
            registerMutation.mutateAsync(input),
        logout: async () => logoutMutation.mutateAsync(),
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        refetchUser: async () => {
            await refetch();
        },
    };
}
