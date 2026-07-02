const request = require('supertest');
const app = require('../server');

describe('POST /compare', () => {
  test('valid body returns 200 and correct MatchResult shape', async () => {
    const res = await request(app)
      .post('/compare')
      .send({ source: 'The quick brown fox', candidate: 'The quick brown fox' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual(
      expect.objectContaining({
        score: expect.any(Number),
        strategies: expect.objectContaining({
          exact: expect.any(Number),
          tokenOverlap: expect.any(Number),
        }),
        matchedTokens: expect.any(Array),
        processingMs: expect.any(Number),
      }),
    );
  });

  test('missing fields returns 400', async () => {
    const res = await request(app)
      .post('/compare')
      .send({ source: 'only source provided' });

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('error');
  });

  test('non-string field returns 400', async () => {
    const res = await request(app)
      .post('/compare')
      .send({ source: 'valid text', candidate: 12345 });

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /health', () => {
  test('returns 200 with { status: "ok" }', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
