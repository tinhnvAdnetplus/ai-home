import { z } from 'zod';

export const planScoreSchema = z
    .record(z.string(), z.number())
    .or(z.null())
    .optional();

export const planProposalSchema = z.object({
    id: z.number(),
    project_id: z.number(),
    label: z.string(),
    score: z.record(z.string(), z.unknown()).nullable().optional(),
    model: z.record(z.string(), z.unknown()),
    model_hash: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type PlanProposal = z.infer<typeof planProposalSchema>;

export const projectStatusSchema = z.enum(['draft', 'submitted', 'archived']);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    title: z.string(),
    status: projectStatusSchema,
    config_version: z.number().nullable().optional(),
    answers: z
        .union([
            z.record(z.string(), z.unknown()),
            z.array(z.unknown()).transform((): Record<string, unknown> => ({})),
        ])
        .nullable()
        .optional(),
    submitted_at: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable().optional(),
    plans: z.array(planProposalSchema).default([]),
});

export type Project = z.infer<typeof projectSchema>;

export const paginationMetaSchema = z.object({
    page: z.number(),
    per_page: z.number(),
    total: z.number(),
    last_page: z.number(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export const projectsResponseSchema = z.object({
    data: z.array(projectSchema),
    meta: paginationMetaSchema.optional(),
});

export type ProjectsResponse = z.infer<typeof projectsResponseSchema>;

// The API returns a project either bare (ProjectResource::$wrap = null) or wrapped in `data`;
// normalise both to `{ data: project }`.
export const singleProjectResponseSchema = z.union([
    z.object({ data: projectSchema }),
    projectSchema.transform((project) => ({ data: project })),
]);

export type SingleProjectResponse = z.infer<typeof singleProjectResponseSchema>;

export const createProjectInputSchema = z.object({
    title: z.string().min(1).max(255).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const updateAnswersInputSchema = z.object({
    answers: z.record(z.string(), z.unknown()),
});

export type UpdateAnswersInput = z.infer<typeof updateAnswersInputSchema>;

export const uploadPlansInputSchema = z.object({
    plans: z
        .array(
            z.object({
                label: z.string().max(100),
                score: z.record(z.string(), z.unknown()).optional(),
                model: z.record(z.string(), z.unknown()),
            }),
        )
        .min(1)
        .max(3),
});

export type UploadPlansInput = z.infer<typeof uploadPlansInputSchema>;
