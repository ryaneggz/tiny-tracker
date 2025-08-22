const request = require('supertest');
const http = require('http');

let app;
let server;

beforeAll(() => {
  // require the app by starting the server module
  app = require('express')();
  // mount the actual server.js app by requiring and exporting express app
});

describe('basic endpoints', () => {
  test('GET /pixel.gif returns 200 and gif', async () => {
    const res = await request('http://localhost:8080').get('/pixel.gif').query({ event_type: 'page_view' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/gif/);
    expect(res.headers['cache-control']).toMatch(/no-store/);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /event accepts JSON and returns 204', async () => {
    const res = await request('http://localhost:8080')
      .post('/event')
      .send({ url: 'http://example.com', event_type: 'page_view' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(204);
  });

  test('GET /stats returns HTML', async () => {
    const res = await request('http://localhost:8080').get('/stats');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toMatch(/Tiny Tracker/);
  });
});
