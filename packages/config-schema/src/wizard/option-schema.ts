import { z } from 'zod';
import {
    keySchema,
    localizedTextSchema,
    mediaRefSchema,
} from '../primitives.js';
import { conditionSchema } from '../condition.js';

export const optionSchema = z
    .object({
        value: keySchema,
        label: localizedTextSchema,
        description: localizedTextSchema.optional(),
        image: mediaRefSchema.optional(),
        disabledWhen: conditionSchema.optional(),
    })
    .strict();

export type Option = z.infer<typeof optionSchema>;

export const imageSelectOptionSchema = z
    .object({
        value: keySchema,
        label: localizedTextSchema,
        description: localizedTextSchema.optional(),
        image: mediaRefSchema,
        disabledWhen: conditionSchema.optional(),
    })
    .strict();

export type ImageSelectOption = z.infer<typeof imageSelectOptionSchema>;
