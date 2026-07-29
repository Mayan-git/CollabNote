import { nanoid } from 'nanoid';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailToken,
  verifyEmailToken,
} from '../utils/jwt';
import { sendMail, verificationEmailTemplate, resetPasswordEmailTemplate } from '../helpers/mailer';
import { env } from '../config/env';
import { activityService } from './activity.service';
import { ActivityAction } from '../models/Activity.model';
import { IUser } from '../models/User.model';
import { workspaceService } from './workspace.service';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function issueTokens(user: IUser): AuthTokens {
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenVersion: user.tokenVersion,
    jti: nanoid(),
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async signup(input: { name: string; email: string; password: string }, ipAddress?: string) {
    if (await userRepository.existsByEmail(input.email)) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const user = await userRepository.create(input);
    await workspaceService.createDefaultWorkspace(user._id, user.name);

    const verifyToken = signEmailToken({ sub: user._id.toString(), purpose: 'verify-email' });
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your CollabNote account',
      html: verificationEmailTemplate(user.name, verifyUrl),
    });

    await activityService.log({ actor: user._id, action: ActivityAction.USER_SIGNUP, ipAddress });

    const tokens = issueTokens(user);
    return { user, ...tokens };
  },

  async login(input: { email: string; password: string }, ipAddress?: string) {
    const user = await userRepository.findByEmailWithPassword(input.email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');
    if (user.isSuspended) throw ApiError.forbidden('This account has been suspended');

    user.lastLoginAt = new Date();
    await user.save();

    await activityService.log({ actor: user._id, action: ActivityAction.USER_LOGIN, ipAddress });

    const tokens = issueTokens(user);
    return { user, ...tokens };
  },

  async refresh(refreshToken: string): Promise<AuthTokens & { user: IUser }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Refresh token has been revoked');
    }

    const tokens = issueTokens(user);
    return { user, ...tokens };
  },

  async logout(userId: string): Promise<void> {
    await userRepository.incrementTokenVersion(userId);
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // do not leak whether the email exists

    const resetToken = signEmailToken({ sub: user._id.toString(), purpose: 'reset-password' });
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your CollabNote password',
      html: resetPasswordEmailTemplate(user.name, resetUrl),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload;
    try {
      payload = verifyEmailToken(token);
    } catch {
      throw ApiError.badRequest('Reset link is invalid or has expired');
    }
    if (payload.purpose !== 'reset-password') throw ApiError.badRequest('Invalid token purpose');

    const user = await userRepository.findByIdWithPassword(payload.sub);
    if (!user) throw ApiError.notFound('User not found');

    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();
  },

  async verifyEmail(token: string): Promise<void> {
    let payload;
    try {
      payload = verifyEmailToken(token);
    } catch {
      throw ApiError.badRequest('Verification link is invalid or has expired');
    }
    if (payload.purpose !== 'verify-email') throw ApiError.badRequest('Invalid token purpose');

    const user = await userRepository.findById(payload.sub);
    if (!user) throw ApiError.notFound('User not found');

    user.isEmailVerified = true;
    await user.save();
  },

  async resendVerification(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (user.isEmailVerified) throw ApiError.badRequest('Email is already verified');

    const verifyToken = signEmailToken({ sub: user._id.toString(), purpose: 'verify-email' });
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your CollabNote account',
      html: verificationEmailTemplate(user.name, verifyUrl),
    });
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();
  },
};
