import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiResponse } from '../utils/ApiResponse';

function handler(_req: unknown, res: import('express').Response): void {
  res.status(429).json(new ApiResponse(429, null, 'Too many requests — please try again later.'));
}

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
  skipSuccessfulRequests: true,
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
