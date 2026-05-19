import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[ERROR]', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(422).json({ success: false, message: err.message });
    return;
  }

  // Mongoose duplicate key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({ success: false, message: 'Duplicate entry' });
    return;
  }

  // Tenant isolation violation
  if (err.message?.startsWith('TENANT_ISOLATION_VIOLATION')) {
    console.error('[CRITICAL] Tenant isolation violation:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.isDev && { stack: err.stack }),
  });
}
