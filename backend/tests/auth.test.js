require('./setup');
const request = require('supertest');
const app = require('../server');

describe('Auth routes', () => {
  const user = { name: 'Test User', email: 'test@example.com', password: 'password123' };

  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(user);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(user.email);
  });

  test('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/register').send(user);

    expect(res.statusCode).toBe(400);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(user);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('rejects login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(user);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  test('blocks access to /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
