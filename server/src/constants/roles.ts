export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const CollaboratorRole = {
  OWNER: 'owner',
  EDITOR: 'editor',
  COMMENTER: 'commenter',
  VIEWER: 'viewer',
} as const;
export type CollaboratorRole = (typeof CollaboratorRole)[keyof typeof CollaboratorRole];

export const ROLE_RANK: Record<CollaboratorRole, number> = {
  [CollaboratorRole.VIEWER]: 0,
  [CollaboratorRole.COMMENTER]: 1,
  [CollaboratorRole.EDITOR]: 2,
  [CollaboratorRole.OWNER]: 3,
};

export function hasAtLeastRole(role: CollaboratorRole, required: CollaboratorRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[required];
}
