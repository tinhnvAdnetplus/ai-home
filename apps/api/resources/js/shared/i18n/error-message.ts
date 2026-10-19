import type { TFunction } from 'i18next';

export function getErrorMessage(error: unknown, t: TFunction): string {
    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string'
    ) {
        if (
            error.code === 'HTTP_ERROR' &&
            'status' in error &&
            typeof error.status === 'number'
        ) {
            return t('errors:HTTP_ERROR', { status: error.status });
        }
        if (
            error.code === 'NETWORK_ERROR' ||
            error.code === 'ABORTED' ||
            error.code === 'EMPTY_BODY' ||
            error.code === 'INVALID_JSON' ||
            error.code === 'INVALID_PAYLOAD'
        ) {
            return t(`errors:${error.code}`);
        }
    }
    return t('errors:UNKNOWN_ERROR');
}
