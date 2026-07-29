import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
  jti: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function signEmailToken(payload: { sub: string; purpose: 'verify-email' | 'reset-password' }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
}

export function verifyEmailToken(token: string): { sub: string; purpose: 'verify-email' | 'reset-password' } {
  return jwt.verify(token, env.JWT_SECRET) as { sub: string; purpose: 'verify-email' | 'reset-password' };
}
