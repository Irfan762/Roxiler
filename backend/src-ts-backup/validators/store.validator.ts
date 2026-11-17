import { z } from 'zod';
import { nameSchema, emailSchema, addressSchema } from './auth.validator';

/** Admin store creation form. */
export const createStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().min(1, 'Store owner is required'),
});

/** Rating must be an integer from 1 to 5. */
export const ratingSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Rating must be a number' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

/** Store listing query params (used by admin and normal user). */
export const storeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'address', 'email', 'rating', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

/** Admin store listing — same as store listing plus optional ownerId filter. */
export const adminStoreQuerySchema = storeQuerySchema.extend({
  ownerId: z.string().optional(),
});
