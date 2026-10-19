import { apiClient, type RequestOptions } from '@/shared/api';
import {
    userResponseSchema,
    type LoginInput,
    type RegisterInput,
    type User,
} from '../schemas/auth-schema';

export async function fetchCurrentUser(
    signal?: AbortSignal,
): Promise<User | null> {
    try {
        const options: RequestOptions = {
            method: 'GET',
            ...(signal ? { signal } : {}),
        };
        const raw = await apiClient('/api/v1/auth/me', options);
        const parsed = userResponseSchema.safeParse(raw);
        if (parsed.success) {
            return parsed.data.data;
        }
        return null;
    } catch {
        return null;
    }
}

export async function login(input: LoginInput): Promise<User> {
    const raw = await apiClient('/api/v1/auth/login', {
        method: 'POST',
        body: input,
    });
    const parsed = userResponseSchema.parse(raw);
    return parsed.data;
}

export async function register(input: RegisterInput): Promise<User> {
    const raw = await apiClient('/api/v1/auth/register', {
        method: 'POST',
        body: input,
    });
    const parsed = userResponseSchema.parse(raw);
    return parsed.data;
}

export async function logout(): Promise<void> {
    await apiClient('/api/v1/auth/logout', {
        method: 'POST',
    });
}
