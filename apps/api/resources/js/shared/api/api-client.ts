import { ApiError, requestJson, requestBlob } from '@/shared/lib/http';

export type ProblemDetails = {
    readonly type?: string | undefined;
    readonly title?: string | undefined;
    readonly status?: number | undefined;
    readonly detail?: string | undefined;
    readonly code?: string | undefined;
    readonly requestId?: string | undefined;
    readonly errors?: Record<string, readonly string[]> | undefined;
    readonly issues?:
        | readonly {
              readonly code: string;
              readonly message: string;
              readonly path?: string | undefined;
          }[]
        | undefined;
};

export function isProblemDetails(data: unknown): data is ProblemDetails {
    return (
        typeof data === 'object' &&
        data !== null &&
        ('title' in data ||
            'detail' in data ||
            'code' in data ||
            'errors' in data)
    );
}

export function extractErrorMessage(
    err: unknown,
    fallback = 'An unexpected error occurred.',
): string {
    if (err instanceof ApiError) {
        if (isProblemDetails(err.responseBody)) {
            if (err.responseBody.detail) {
                return err.responseBody.detail;
            }
            if (err.responseBody.title) {
                return err.responseBody.title;
            }
            if (err.responseBody.errors) {
                const firstKey = Object.keys(err.responseBody.errors)[0];
                const firstMsgs = firstKey
                    ? err.responseBody.errors[firstKey]
                    : undefined;
                const firstMsg = firstMsgs?.[0];
                if (firstMsg) {
                    return firstMsg;
                }
            }
        }
        if (err.status === 401) {
            return 'ログインが必要です。';
        }
        if (err.status === 429) {
            return 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください。';
        }
        return err.message || fallback;
    }
    if (err instanceof Error) {
        return err.message;
    }
    return fallback;
}

export type RequestOptions = Omit<RequestInit, 'body' | 'signal'> & {
    readonly body?: unknown;
    readonly signal?: AbortSignal | null | undefined;
    readonly params?:
        Record<string, string | number | boolean | undefined> | undefined;
};

function buildUrlAndInit(
    endpoint: string,
    options: RequestOptions,
): { readonly url: string; readonly init: RequestInit } {
    const {
        params,
        headers: customHeaders,
        body,
        method = 'GET',
        signal,
        ...rest
    } = options;

    let url = endpoint;
    if (params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) searchParams.set(key, String(value));
        }
        const qs = searchParams.toString();
        if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }

    const headers = new Headers(customHeaders);
    if (
        body !== undefined &&
        !(body instanceof FormData) &&
        !headers.has('Content-Type')
    ) {
        headers.set('Content-Type', 'application/json');
    }

    const init: RequestInit = { ...rest, method, headers };
    if (body !== undefined) {
        init.body =
            body instanceof FormData || typeof body === 'string'
                ? body
                : JSON.stringify(body);
    }
    if (signal) init.signal = signal;

    return { url, init };
}

export async function apiClient(
    endpoint: string,
    options: RequestOptions = {},
): Promise<unknown> {
    const { url, init } = buildUrlAndInit(endpoint, options);
    return requestJson(url, init);
}

export async function apiClientBlob(
    endpoint: string,
    options: RequestOptions = {},
): Promise<Blob> {
    const { url, init } = buildUrlAndInit(endpoint, options);
    return requestBlob(url, init);
}
