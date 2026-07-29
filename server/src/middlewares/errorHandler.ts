import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../config/logger';
import { isProd } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof ZodError) {
    apiError = new ApiError(
      422,
      'Validation failed',
      err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    );
  } else if (err instanceof mongoose.Error.ValidationError) {
    apiError = new ApiError(
      422,
      'Validation failed',
      Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
    );
  } else if (err instanceof mongoose.Error.CastError) {
    apiError = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  } else if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue ?? {};
    apiError = ApiError.conflict(`Duplicate value for: ${Object.keys(keyValue).join(', ')}`);
  } else if (err instanceof Error) {
    apiError = new ApiError(500, isProd ? 'Internal server error' : err.message, [], err.stack);
  } else {
    apiError = ApiError.internal();
  }

  if (apiError.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${apiError.message}`, { stack: apiError.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} — ${apiError.message}`);
  }

  const response = new ApiResponse(apiError.statusCode, null, apiError.message, {
    errors: apiError.errors,
    ...(isProd ? {} : { stack: apiError.stack }),
  });

  res.status(apiError.statusCode).json(response);
}
