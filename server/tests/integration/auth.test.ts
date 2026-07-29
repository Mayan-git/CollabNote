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

const validUser = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'SuperSecret1',
};

describe('POST /api/v1/auth/signup', () => {
  it('creates a new account and returns an access token', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ ...validUser, password: 'weak' });

    expect(res.status).toBe(422);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/v1/auth/signup').send(validUser);
    const res = await request(app).post('/api/v1/auth/signup').send(validUser);

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/signup').send(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user profile for a valid token', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send(validUser);
    const token = signupRes.body.data.accessToken;

    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('invalidates the access token after logout', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send(validUser);
    const token = signupRes.body.data.accessToken;

    const logoutRes = await request(app).post('/api/v1/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);

    const meRes = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(401);
  });
});
