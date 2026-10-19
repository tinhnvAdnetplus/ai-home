import { requestJson } from '@/shared/lib/http';

export function isDemoMode(): boolean {
    if (!import.meta.env.DEV || typeof window === 'undefined') return false;
    return (
        window.location.hash.includes('demo=1') ||
        window.location.search.includes('demo=1')
    );
}

export async function requestAdmin(
    url: string,
    init?: RequestInit,
): Promise<unknown> {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    return requestJson(url, { ...init, headers });
}
