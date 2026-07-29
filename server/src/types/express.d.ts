import { UserRole } from '../constants/roles';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        tokenVersion: number;
      };
    }
  }
}

export {};
