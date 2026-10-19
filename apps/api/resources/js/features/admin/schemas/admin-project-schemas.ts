import { z } from 'zod';
import type { AdminProjectsResponse } from '../types/admin-types';

const projectPlanSchema = z.object({
    id: z.number(),
    label: z.string(),
    scoreTotal: z.number().catch(80),
    scoreHousework: z.number().catch(80),
    scoreStorage: z.number().catch(80),
    scoreDaylight: z.number().catch(80),
    scoreBudget: z.number().catch(80),
    floorAreaM2: z.number().catch(100),
    tsubo: z.number().catch(30),
});

const projectItemSchema = z.object({
    id: z.number(),
    userId: z.number().catch(1),
    title: z.string(),
    status: z.string(),
    configVersion: z.number().nullable().catch(null),
    answers: z.record(z.string(), z.unknown()).catch({}),
    createdAt: z.string().nullable().catch(null),
    updatedAt: z.string().nullable().catch(null),
    plans: z.array(projectPlanSchema).catch([]),
    user: z
        .object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
        })
        .nullable()
        .optional()
        .catch(null),
});

export const adminProjectsResponseSchema: z.ZodType<
    AdminProjectsResponse,
    z.ZodTypeDef,
    unknown
> = z.object({
    data: z.array(projectItemSchema),
    meta: z.object({
        page: z.number(),
        perPage: z.number(),
        total: z.number(),
        lastPage: z.number(),
    }),
});
