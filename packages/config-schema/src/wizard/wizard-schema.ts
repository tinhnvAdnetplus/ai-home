import { z } from 'zod';
import { keySchema, localizedTextSchema } from '../primitives.js';
import { STEP_ICONS } from './types.js';
import { fieldSchema } from './field-schemas.js';

export const sectionSchema = z
    .object({
        key: keySchema,
        title: localizedTextSchema,
        description: localizedTextSchema.optional(),
        fields: z.array(fieldSchema),
    })
    .strict();

export type Section = z.infer<typeof sectionSchema>;

export const stepSchema = z
    .object({
        key: keySchema,
        title: localizedTextSchema,
        subtitle: localizedTextSchema.optional(),
        icon: z.enum(STEP_ICONS).optional(),
        sections: z.array(sectionSchema),
    })
    .strict();

export type Step = z.infer<typeof stepSchema>;

export const wizardSchema = z
    .object({
        schemaVersion: z.literal(1),
        steps: z.array(stepSchema),
    })
    .strict();

export type WizardConfig = z.infer<typeof wizardSchema>;
