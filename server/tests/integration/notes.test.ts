import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { connectTestDB, clearTestDB, disconnectTestDB } from '../helpers/db';

const app = createApp();

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

async function signupAndGetWorkspace(email: string) {
  const signupRes = await request(app)
    .post('/api/v1/auth/signup')
    .send({ name: 'Test User', email, password: 'SuperSecret1' });

  const token = signupRes.body.data.accessToken as string;

  const workspacesRes = await request(app).get('/api/v1/workspaces').set('Authorization', `Bearer ${token}`);

  const workspaceId = workspacesRes.body.data.workspaces[0]._id as string;
  return { token, workspaceId, userId: signupRes.body.data.user._id as string };
}

describe('Notes CRUD', () => {
  it('creates and retrieves a note', async () => {
    const { token, workspaceId } = await signupAndGetWorkspace('owner@example.com');

    const createRes = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My first note', workspace: workspaceId });

    expect(createRes.status).toBe(201);
    const noteId = createRes.body.data.note._id;

    const getRes = await request(app).get(`/api/v1/notes/${noteId}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.note.title).toBe('My first note');
    expect(getRes.body.data.role).toBe('owner');
  });

  it('lists only notes owned by or shared with the requesting user', async () => {
    const owner = await signupAndGetWorkspace('owner2@example.com');
    const stranger = await signupAndGetWorkspace('stranger@example.com');

    await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Private note', workspace: owner.workspaceId });

    const listRes = await request(app).get('/api/v1/notes').set('Authorization', `Bearer ${stranger.token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.items).toHaveLength(0);
  });

  it('prevents a non-collaborator from reading a private note', async () => {
    const owner = await signupAndGetWorkspace('owner3@example.com');
    const stranger = await signupAndGetWorkspace('stranger3@example.com');

    const createRes = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Secret', workspace: owner.workspaceId });
    const noteId = createRes.body.data.note._id;

    const res = await request(app).get(`/api/v1/notes/${noteId}`).set('Authorization', `Bearer ${stranger.token}`);
    expect(res.status).toBe(403);
  });

  it('allows a viewer collaborator to read but not edit a note', async () => {
    const owner = await signupAndGetWorkspace('owner4@example.com');
    const viewer = await signupAndGetWorkspace('viewer4@example.com');

    const createRes = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Shared note', workspace: owner.workspaceId });
    const noteId = createRes.body.data.note._id;

    await request(app)
      .post(`/api/v1/notes/${noteId}/collaborators`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ email: 'viewer4@example.com', role: 'viewer' });

    const readRes = await request(app).get(`/api/v1/notes/${noteId}`).set('Authorization', `Bearer ${viewer.token}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.role).toBe('viewer');

    const editRes = await request(app)
      .patch(`/api/v1/notes/${noteId}`)
      .set('Authorization', `Bearer ${viewer.token}`)
      .send({ title: 'Hacked title' });
    expect(editRes.status).toBe(403);
  });

  it('moves a note to trash and restores it', async () => {
    const { token, workspaceId } = await signupAndGetWorkspace('owner5@example.com');

    const createRes = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Temp note', workspace: workspaceId });
    const noteId = createRes.body.data.note._id;

    const trashRes = await request(app).delete(`/api/v1/notes/${noteId}`).set('Authorization', `Bearer ${token}`);
    expect(trashRes.status).toBe(200);

    const restoreRes = await request(app).post(`/api/v1/notes/${noteId}/restore`).set('Authorization', `Bearer ${token}`);
    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.data.note.isTrashed).toBe(false);
  });

  it('toggles pin and favorite flags', async () => {
    const { token, workspaceId } = await signupAndGetWorkspace('owner6@example.com');

    const createRes = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Pinnable', workspace: workspaceId });
    const noteId = createRes.body.data.note._id;

    const pinRes = await request(app).post(`/api/v1/notes/${noteId}/pin`).set('Authorization', `Bearer ${token}`);
    expect(pinRes.body.data.note.isPinned).toBe(true);

    const favRes = await request(app).post(`/api/v1/notes/${noteId}/favorite`).set('Authorization', `Bearer ${token}`);
    expect(favRes.body.data.note.isFavorite).toBe(true);
  });
});
