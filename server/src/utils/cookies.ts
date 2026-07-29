import { CookieOptions } from 'express';
import { isProd } from '../config/env';

export function buildAccessTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  };
}

export function buildRefreshTokenCookieOptions(rememberMe: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  };
}
