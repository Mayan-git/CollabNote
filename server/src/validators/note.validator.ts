import { z } from 'zod';
import { CollaboratorRole } from '../constants/roles';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().trim().max(300).optional(),
    workspace: objectId,
    folder: objectId.nullable().optional(),
    content: z.record(z.string(), z.unknown()).optional(),
    tags: z.array(z.string().trim().toLowerCase().max(40)).optional(),
  }),
});

export const updateNoteSchema = z.object({
  body: z.object({
    title: z.string().trim().max(300).optional(),
    content: z.record(z.string(), z.unknown()).optional(),
    plainText: z.string().optional(),
    icon: z.string().max(10).optional(),
    coverImage: z.string().optional(),
    folder: objectId.nullable().optional(),
    tags: z.array(z.string().trim().toLowerCase().max(40)).optional(),
  }),
  params: z.object({ id: objectId }),
});

export const listNotesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    folder: objectId.optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    filter: z.enum(['all', 'pinned', 'favorites', 'archived', 'trash', 'shared']).optional(),
  }),
});

export const addCollaboratorSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    role: z.enum([CollaboratorRole.VIEWER, CollaboratorRole.COMMENTER, CollaboratorRole.EDITOR]),
  }),
  params: z.object({ id: objectId }),
});

export const updateShareLinkSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
    role: z.enum(['viewer', 'commenter', 'editor']).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  }),
  params: z.object({ id: objectId }),
});

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});
