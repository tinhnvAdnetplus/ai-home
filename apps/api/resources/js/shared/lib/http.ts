export type ApiErrorCode =
    'NETWORK_ERROR' | 'ABORTED' | 'HTTP_ERROR' | 'EMPTY_BODY' | 'INVALID_JSON';

export class ApiError extends Error {
    public readonly code: ApiErrorCode;
    public readonly status: number;
    public readonly statusText: string;
    public readonly responseBody: unknown;

    public constructor(
        code: ApiErrorCode,
        status: number,
        statusText: string,
        responseBody?: unknown,
    ) {
        super(
            code === 'HTTP_ERROR' && status > 0
                ? `HTTP_ERROR (HTTP ${status.toString()}: ${statusText})`
                : code,
        );
        this.name = 'ApiError';
        this.code = code;
        this.status = status;
        this.statusText = statusText;
        this.responseBody = responseBody;
    }
}

export function getXsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = /(?:^|;\s*)XSRF-TOKEN=([^;]*)/.exec(document.cookie);
    const token = match?.[1];
    if (!token) return null;
    try {
        return decodeURIComponent(token);
    } catch {
        return token;
    }
}

let csrfPromise: Promise<void> | null = null;

export async function ensureCsrfToken(): Promise<void> {
    if (typeof document === 'undefined' || getXsrfToken() !== null) return;
    csrfPromise ??= (async () => {
        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
        } finally {
            csrfPromise = null;
        }
    })();
    await csrfPromise;
}

export async function refreshCsrfToken(): Promise<void> {
    if (typeof document === 'undefined') return;
    csrfPromise = (async () => {
        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
        } finally {
            csrfPromise = null;
        }
    })();
    await csrfPromise;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function sendRequest(
    input: string,
    init?: RequestInit,
    defaultAccept = 'application/json',
): Promise<Response> {
    const method = (init?.method ?? 'GET').toUpperCase();
    const isMutating = MUTATING_METHODS.has(method);
    if (isMutating) await ensureCsrfToken();

    const buildInit = (): RequestInit => {
        const headers = new Headers(init?.headers);
        if (!headers.has('Accept')) headers.set('Accept', defaultAccept);
        const xsrf = getXsrfToken();
        if (xsrf && !headers.has('X-XSRF-TOKEN'))
            headers.set('X-XSRF-TOKEN', xsrf);
        return {
            ...init,
            headers,
            credentials: init?.credentials ?? 'same-origin',
        };
    };

    let response: Response;
    try {
        response = await fetch(input, buildInit());
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new ApiError('ABORTED', 0, 'Aborted');
        }
        throw new ApiError('NETWORK_ERROR', 0, 'NetworkError');
    }

    if (response.status === 419 && isMutating) {
        await refreshCsrfToken();
        try {
            response = await fetch(input, buildInit());
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                throw new ApiError('ABORTED', 0, 'Aborted');
            }
            throw new ApiError('NETWORK_ERROR', 0, 'NetworkError');
        }
    }

    if (!response.ok) {
        let errorBody: unknown = null;
        try {
            const rawBody = await response.text();
            if (rawBody.trim() !== '') errorBody = JSON.parse(rawBody);
        } catch {
            // Ignore parse errors on error bodies
        }
        throw new ApiError(
            'HTTP_ERROR',
            response.status,
            response.statusText,
            errorBody,
        );
    }

    return response;
}

export async function requestJson(
    input: string,
    init?: RequestInit,
): Promise<unknown> {
    const response = await sendRequest(input, init, 'application/json');
    if (response.status === 204) return null;
    const text = await response.text();
    if (text.trim() === '') {
        throw new ApiError('EMPTY_BODY', response.status, response.statusText);
    }
    try {
        return JSON.parse(text);
    } catch {
        throw new ApiError(
            'INVALID_JSON',
            response.status,
            response.statusText,
        );
    }
}

export async function requestBlob(
    input: string,
    init?: RequestInit,
): Promise<Blob> {
    const response = await sendRequest(input, init, 'application/pdf, */*');
    return response.blob();
}
