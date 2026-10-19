import { z } from 'zod';
import {
    bindingKeySchema,
    keySchema,
    localizedTextSchema,
} from '../primitives.js';
import { conditionSchema } from '../condition.js';

export const baseFieldProps = {
    key: keySchema,
    label: localizedTextSchema,
    help: localizedTextSchema.optional(),
    required: z.boolean().default(false),
    visibleWhen: conditionSchema.optional(),
    disabledWhen: conditionSchema.optional(),
    binding: bindingKeySchema.optional(),
    summaryLabel: localizedTextSchema.optional(),
};
