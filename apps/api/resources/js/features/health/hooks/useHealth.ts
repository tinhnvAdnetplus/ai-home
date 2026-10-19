import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../api/health-api';
import type { HealthPayload } from '../schemas/health-schema';

export const HEALTH_QUERY_KEY = ['health'] as const;

export function useHealth() {
    return useQuery<HealthPayload>({
        queryKey: HEALTH_QUERY_KEY,
        queryFn: ({ signal }) => fetchHealth(signal),
    });
}
