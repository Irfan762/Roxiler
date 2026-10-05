import { z } from 'zod';
import { nameSchema, emailSchema, passwordSchema, addressSchema } from './auth.schema';

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: z
    .string()
    .min(1, 'Address is required')
    .max(400, 'Address must be at most 400 characters')
    .trim(),
  password: passwordSchema,
  role: z.enum(['NORMAL_USER', 'SYSTEM_ADMIN', 'STORE_OWNER'], {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
});

export const createStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: z
    .string()
    .min(1, 'Address is required')
    .max(400, 'Address must be at most 400 characters')
    .trim(),
  ownerId: z.string().min(1, 'Please select a store owner'),
});

export const ratingSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Rating must be a number' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});
