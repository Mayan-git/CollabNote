export type UserRole = 'user' | 'admin';
export type CollaboratorRole = 'owner' | 'editor' | 'commenter' | 'viewer';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isSuspended: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  };
  createdAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  owner: string;
}

export interface Folder {
  _id: string;
  name: string;
  color: string;
  icon: string;
  workspace: string;
  parent: string | null;
}

export interface NoteCollaborator {
  user: User;
  role: CollaboratorRole;
  addedAt: string;
}

export interface ShareLink {
  enabled: boolean;
  token: string;
  role: 'viewer' | 'commenter' | 'editor';
  expiresAt: string | null;
}

export interface Note {
  _id: string;
  title: string;
  content: Record<string, unknown>;
  icon?: string;
  coverImage?: string;
  owner: User;
  workspace: string;
  folder: string | null;
  tags: string[];
  collaborators: NoteCollaborator[];
  shareLink: ShareLink;
  isPublic: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt?: string | null;
  currentVersion: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  note: string;
  author: User;
  content: string;
  anchor?: { from: number; to: number } | null;
  parentComment: string | null;
  mentions: User[];
  isResolved: boolean;
  createdAt: string;
}

export interface NoteVersion {
  _id: string;
  versionNumber: number;
  title: string;
  content: Record<string, unknown>;
  editedBy: User;
  changeType: 'auto' | 'manual' | 'restore';
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  type: 'invite' | 'comment' | 'mention' | 'share' | 'note_updated' | 'system';
  title: string;
  message: string;
  link?: string;
  note?: string;
  sender?: User;
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}
