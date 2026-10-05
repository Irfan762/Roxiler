import { Role } from '@prisma/client';
import { Request } from 'express';

/** Extends Express Request with the authenticated user payload. */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

/** JWT payload structure. */
export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

/** Generic paginated response meta. */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

/** Public-safe user object (no password hash). */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  address: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
