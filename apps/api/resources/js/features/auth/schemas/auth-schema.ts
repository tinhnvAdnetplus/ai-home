import { z } from 'zod';

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['admin', 'editor', 'architect', 'user']).or(z.string()),
    abilities: z.array(z.string()).default([]),
});

export type User = z.infer<typeof userSchema>;

export const userResponseSchema = z.object({
    data: userSchema,
});

export type UserResponse = z.infer<typeof userResponseSchema>;

export const sessionResponseSchema = z.object({
    data: userSchema.nullable(),
});

export const loginInputSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z
    .object({
        name: z.string().trim().min(1).max(255),
        email: z.string().trim().email(),
        password: z.string().min(10),
        password_confirmation: z.string().min(10),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'password_confirmation_mismatch',
        path: ['password_confirmation'],
    });

export type RegisterInput = z.infer<typeof registerInputSchema>;
