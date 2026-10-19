import { useEffect } from 'react';
import { useSession } from './useSession';

function isDevDemoActive(): boolean {
    if (!import.meta.env.DEV) return false;
    if (typeof window === 'undefined') return false;
    return /[?&]demo=1/.test(window.location.hash);
}

export function useRequireAuth(redirectTarget = '/projects'): {
    readonly isAuthenticated: boolean;
    readonly isAuthLoading: boolean;
} {
    const { isAuthenticated, isLoading: isAuthLoading } = useSession();
    const isDevDemo = isDevDemoActive();

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated && !isDevDemo) {
            const encoded = encodeURIComponent(redirectTarget);
            window.location.hash = `#/login?redirect=${encoded}`;
        }
    }, [isAuthLoading, isAuthenticated, isDevDemo, redirectTarget]);

    return {
        isAuthenticated: isAuthenticated || isDevDemo,
        isAuthLoading: isDevDemo ? false : isAuthLoading,
    };
}
