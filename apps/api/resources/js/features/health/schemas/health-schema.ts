import { z } from 'zod';

export const healthSchema = z.object({
    status: z.string(),
    db: z.string(),
    time: z.string(),
});

export type HealthPayload = z.infer<typeof healthSchema>;

export class SchemaError extends Error {
    public readonly code: 'INVALID_PAYLOAD';

    public constructor(message = 'INVALID_PAYLOAD') {
        super(message);
        this.name = 'SchemaError';
        this.code = 'INVALID_PAYLOAD';
    }
}

export function parseHealthResponse(raw: unknown): HealthPayload {
    const result = healthSchema.safeParse(raw);
    if (!result.success) {
        throw new SchemaError();
    }
    return result.data;
}
