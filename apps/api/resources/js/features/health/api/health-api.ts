import { requestJson } from '@/shared/lib/http';
import {
    parseHealthResponse,
    type HealthPayload,
} from '../schemas/health-schema';

export async function fetchHealth(
    signal?: AbortSignal,
): Promise<HealthPayload> {
    const raw = await requestJson(
        '/api/v1/health',
        signal !== undefined ? { signal } : undefined,
    );
    return parseHealthResponse(raw);
}
