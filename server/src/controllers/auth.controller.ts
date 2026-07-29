import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { authService } from '../services/auth.service';
import { buildAccessTokenCookieOptions, buildRefreshTokenCookieOptions } from '../utils/cookies';
import { userRepository } from '../repositories/user.repository';

function setAuthCookies(res: Response, accessToken: string, refreshToken: string, rememberMe = false): void {
  res.cookie('accessToken', accessToken, buildAccessTokenCookieOptions());
  res.cookie('refreshToken', refreshToken, buildRefreshTokenCookieOptions(rememberMe));
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.signup(req.body, req.ip);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json(new ApiResponse(201, { user, accessToken }, 'Account created — check your email to verify'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, req.ip);
  setAuthCookies(res, accessToken, refreshToken, req.body.rememberMe);
  res.status(200).json(new ApiResponse(200, { user, accessToken }, 'Logged in successfully'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
  if (!token) throw ApiError.unauthorized('Refresh token missing');

  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json(new ApiResponse(200, { user, accessToken }, 'Token refreshed'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) await authService.logout(req.user.id);
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  res.status(200).json(new ApiResponse(200, null, 'If that email exists, a reset link has been sent'));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json(new ApiResponse(200, null, 'Password reset successfully — please log in'));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.body.token);
  res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await authService.resendVerification(req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'Verification email sent'));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.status(200).json(new ApiResponse(200, null, 'Password changed — please log in again'));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await userRepository.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json(new ApiResponse(200, { user }));
});
