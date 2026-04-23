import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: error.issues[0]?.message ?? 'Ошибка валидации данных',
      issues: error.issues,
    });
  }

  logger.error(error);
  return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
};