import { z } from 'zod';

export const DENIED_KEYS = [
    'constructor',
    'prototype',
    '__proto__',
    'proto',
    'hasownproperty',
    'tostring',
    'valueof',
    'isprototypeof',
    'propertyisenumerable',
    'tolocalestring',
] as const;

export const KEY_REGEX = /^[a-z][a-z0-9_]{0,47}$/;
export const BINDING_KEY_REGEX = /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/;
export const MEDIA_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;

export const localizedTextSchema = z
    .object({
        ja: z.string().trim().min(1).max(500),
        en: z.string().trim().min(1).max(500).optional(),
        vi: z.string().trim().min(1).max(500).optional(),
    })
    .strict();

export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const keySchema = z
    .string()
    .regex(KEY_REGEX, {
        message:
            'Key must match ^[a-z][a-z0-9_]{0,47}$ (1-48 lowercase letters, numbers, underscores)',
    })
    .refine(
        (val) => !DENIED_KEYS.some((denied) => denied === val.toLowerCase()),
        {
            message: 'Key is in the forbidden prototype pollution deny-list',
        },
    );

export type Key = z.infer<typeof keySchema>;

export const bindingKeySchema = z
    .string()
    .max(64, { message: 'Binding key must be at most 64 characters' })
    .regex(BINDING_KEY_REGEX, {
        message:
            'Binding key must match dot.case ^[a-z][a-zA-Z0-9]*(\\.[a-z][a-zA-Z0-9]*)*$',
    });

export type BindingKey = z.infer<typeof bindingKeySchema>;

export const mediaRefSchema = z
    .object({
        mediaId: z.string().regex(MEDIA_ID_REGEX, {
            message: 'mediaId must be 1-64 characters matching [A-Za-z0-9_-]',
        }),
        alt: localizedTextSchema,
    })
    .strict();

export type MediaRef = z.infer<typeof mediaRefSchema>;
