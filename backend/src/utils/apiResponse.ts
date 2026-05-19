import { Response } from 'express';

export function success(res: Response, data: unknown, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}

export function paginated(
  res: Response,
  data: unknown[],
  meta: { total: number; page: number; limit: number }
): Response {
  return res.json({ success: true, data, meta });
}

export function error(res: Response, message: string, statusCode = 400): Response {
  return res.status(statusCode).json({ success: false, message });
}
