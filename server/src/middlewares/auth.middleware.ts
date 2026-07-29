import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/jwt';
import { UserModel } from '../models/User.model';
import { UserRole } from '../constants/roles';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken as string;
  return null;
}

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication token missing');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  const user = await UserModel.findById(payload.sub).select('email role tokenVersion isSuspended').lean();
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.isSuspended) throw ApiError.forbidden('This account has been suspended');
  if (user.tokenVersion !== payload.tokenVersion) throw ApiError.unauthorized('Session has been invalidated');

  req.user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
  next();
});

export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.sub).select('email role tokenVersion').lean();
    if (user && user.tokenVersion === payload.tokenVersion) {
      req.user = { id: user._id.toString(), email: user.email, role: user.role, tokenVersion: user.tokenVersion };
    }
  } catch {
    // ignore invalid token for optional auth
  }
  next();
});

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient permissions'));
    next();
  };
}
