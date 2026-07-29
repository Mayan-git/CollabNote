import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../constants/roles';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isSuspended: boolean;
  tokenVersion: number;
  lastLoginAt?: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isEmailVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password: _password, ...rest } = ret;
    return rest;
  },
});

export const UserModel = model<IUser>('User', userSchema);
