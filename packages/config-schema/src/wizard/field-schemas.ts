import { z } from 'zod';
import { localizedTextSchema } from '../primitives.js';
import { UPLOAD_MIME_TYPES } from './types.js';
import { imageSelectOptionSchema, optionSchema } from './option-schema.js';
import { baseFieldProps } from './base-field.js';

export const textFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('text'),
        maxLength: z.number().int().min(1).max(500).optional(),
        placeholder: localizedTextSchema.optional(),
        defaultValue: z.string().optional(),
    })
    .strict();

export const textareaFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('textarea'),
        maxLength: z.number().int().min(1).max(2000).optional(),
        showCounter: z.boolean().optional(),
        placeholder: localizedTextSchema.optional(),
        defaultValue: z.string().optional(),
    })
    .strict();

export const numberFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('number'),
        min: z.number().optional(),
        max: z.number().optional(),
        step: z.number().positive().optional(),
        unit: z.string().optional(),
        allowedUnits: z.array(z.string()).optional(),
        defaultValue: z.number().optional(),
    })
    .strict();

export const rangeFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('range'),
        min: z.number(),
        max: z.number(),
        step: z.number().positive(),
        unit: z.string().optional(),
        defaultValue: z.number().optional(),
    })
    .strict();

export const selectFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('select'),
        options: z.array(optionSchema),
        placeholder: localizedTextSchema.optional(),
        defaultValue: z.string().optional(),
    })
    .strict();

export const radioFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('radio'),
        options: z.array(optionSchema),
        defaultValue: z.string().optional(),
    })
    .strict();

export const checkboxGroupFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('checkbox_group'),
        options: z.array(optionSchema),
        minSelected: z.number().int().min(0).optional(),
        maxSelected: z.number().int().min(1).optional(),
        defaultValue: z.array(z.string()).optional(),
    })
    .strict();

export const imageSelectFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('image_select'),
        options: z.array(imageSelectOptionSchema),
        multiple: z.boolean().default(false),
        minSelected: z.number().int().min(0).optional(),
        maxSelected: z.number().int().min(1).optional(),
        defaultValue: z.union([z.string(), z.array(z.string())]).optional(),
    })
    .strict();

export const booleanFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('boolean'),
        defaultValue: z.boolean().optional(),
    })
    .strict();

export const uploadFieldSchema = z
    .object({
        ...baseFieldProps,
        type: z.literal('upload'),
        accept: z.array(z.enum(UPLOAD_MIME_TYPES)),
        maxFiles: z.number().int().min(1).max(10),
        maxSizeMb: z.number().int().min(1).max(20),
    })
    .strict();

export const fieldSchema = z.discriminatedUnion('type', [
    textFieldSchema,
    textareaFieldSchema,
    numberFieldSchema,
    rangeFieldSchema,
    selectFieldSchema,
    radioFieldSchema,
    checkboxGroupFieldSchema,
    imageSelectFieldSchema,
    booleanFieldSchema,
    uploadFieldSchema,
]);

export type Field = z.infer<typeof fieldSchema>;
