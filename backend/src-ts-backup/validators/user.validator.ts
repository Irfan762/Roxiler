import { z } from 'zod';
import { nameSchema, emailSchema, passwordSchema, addressSchema } from './auth.validator';

/** Admin can create users with role selection (not restricted to NORMAL_USER). */
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(['NORMAL_USER', 'SYSTEM_ADMIN', 'STORE_OWNER']),
});

/** Admin user listing query params. */
export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'email', 'address', 'role', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  role: z.enum(['NORMAL_USER', 'SYSTEM_ADMIN', 'STORE_OWNER']).optional(),
});
