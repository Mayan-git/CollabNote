import { describe, it, expect } from 'vitest';
import { ApiError } from '../../src/utils/ApiError';
import { normalizePagination, buildPaginatedResult } from '../../src/utils/pagination';
import { extractPlainText, countWords } from '../../src/utils/richText';
import { hasAtLeastRole, CollaboratorRole } from '../../src/constants/roles';

describe('ApiError', () => {
  it('creates a 404 error via the notFound factory', () => {
    const error = ApiError.notFound('Note not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Note not found');
    expect(error.isOperational).toBe(true);
  });

  it('defaults to sensible messages', () => {
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.conflict().statusCode).toBe(409);
  });
});

describe('pagination', () => {
  it('normalizes page/limit with sane defaults', () => {
    const result = normalizePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  it('clamps limit to the maximum', () => {
    const result = normalizePagination({ limit: '500' });
    expect(result.limit).toBe(100);
  });

  it('computes skip correctly for page 3', () => {
    const result = normalizePagination({ page: '3', limit: '10' });
    expect(result.skip).toBe(20);
  });

  it('builds pagination metadata', () => {
    const result = buildPaginatedResult([1, 2, 3], 25, 1, 10);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPrevPage).toBe(false);
  });
});

describe('richText', () => {
  it('extracts plain text from a TipTap document', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'world' }] },
      ],
    };
    expect(extractPlainText(doc)).toContain('Hello');
    expect(extractPlainText(doc)).toContain('world');
  });

  it('counts words from plain text', () => {
    expect(countWords('Hello world this is a test')).toBe(6);
    expect(countWords('')).toBe(0);
  });
});

describe('role hierarchy', () => {
  it('ranks owner above editor above commenter above viewer', () => {
    expect(hasAtLeastRole(CollaboratorRole.OWNER, CollaboratorRole.EDITOR)).toBe(true);
    expect(hasAtLeastRole(CollaboratorRole.VIEWER, CollaboratorRole.EDITOR)).toBe(false);
    expect(hasAtLeastRole(CollaboratorRole.EDITOR, CollaboratorRole.EDITOR)).toBe(true);
  });
});
