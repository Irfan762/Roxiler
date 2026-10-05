import { Response } from 'express';

export function success<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true, data });
}

export function error(res: Response, message: string, status = 400): Response {
  return res.status(status).json({ success: false, message });
}

export function paginated<T>(
  res: Response,
  data: T,
  meta: { currentPage: number; totalPages: number; totalRecords: number },
  status = 200,
): Response {
  return res.status(status).json({ success: true, data, meta });
}
