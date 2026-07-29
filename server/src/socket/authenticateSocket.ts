import { Socket, DefaultEventsMap } from 'socket.io';
import cookie from 'cookie';
import { verifyAccessToken } from '../utils/jwt';
import { UserModel } from '../models/User.model';

export interface AuthenticatedSocketData {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type AppSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, AuthenticatedSocketData>;

function extractToken(socket: AppSocket): string | null {
  const authToken = socket.handshake.auth?.token as string | undefined;
  if (authToken) return authToken;

  const header = socket.handshake.headers.cookie;
  if (!header) return null;

  const parsed = cookie.parse(header);
  return parsed.accessToken ?? null;
}

export async function authenticateSocket(socket: AppSocket): Promise<void> {
  const token = extractToken(socket);
  if (!token) throw new Error('Authentication token missing');

  const payload = verifyAccessToken(token);
  const user = await UserModel.findById(payload.sub).select('name email avatarUrl tokenVersion isSuspended').lean();

  if (!user) throw new Error('User no longer exists');
  if (user.isSuspended) throw new Error('Account suspended');
  if (user.tokenVersion !== payload.tokenVersion) throw new Error('Session invalidated');

  socket.data = {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}
