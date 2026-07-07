require('./setup');
const request = require('supertest');
const app = require('../server');

const registerAndLogin = async () => {
  const user = { name: 'Jane Doe', email: 'jane@example.com', password: 'password123' };
  const res = await request(app).post('/api/auth/register').send(user);
  return res.body.token;
};

describe('Expense routes', () => {
  test('rejects creating an expense without auth', async () => {
    const res = await request(app).post('/api/expenses').send({ title: 'Coffee', amount: 5 });
    expect(res.statusCode).toBe(401);
  });

  test('creates and fetches an expense for the logged in user', async () => {
    const token = await registerAndLogin();

    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Groceries', amount: 42.5, category: 'Food' });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.title).toBe('Groceries');

    const listRes = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.expenses).toHaveLength(1);
  });

  test('rejects an expense with a non-positive amount', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bad expense', amount: -5 });

    expect(res.statusCode).toBe(400);
  });

  test('updates and deletes an expense', async () => {
    const token = await registerAndLogin();

    const createRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Movie ticket', amount: 12, category: 'Entertainment' });

    const id = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/expenses/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 15 });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.amount).toBe(15);

    const deleteRes = await request(app)
      .delete(`/api/expenses/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
  });

  test('returns summary stats grouped by category', async () => {
    const token = await registerAndLogin();

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bus fare', amount: 3, category: 'Transport' });

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Taxi', amount: 20, category: 'Transport' });

    const res = await request(app)
      .get('/api/expenses/stats/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(23);
    expect(res.body.byCategory[0].category).toBe('Transport');
  });

  test('a user cannot see another user\'s expenses', async () => {
    const tokenA = await registerAndLogin();

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Private expense', amount: 9 });

    const userB = { name: 'Bob', email: 'bob@example.com', password: 'password123' };
    const resB = await request(app).post('/api/auth/register').send(userB);
    const tokenB = resB.body.token;

    const listRes = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(listRes.body.expenses).toHaveLength(0);
  });
});
