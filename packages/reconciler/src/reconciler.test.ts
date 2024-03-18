import {Reconciler} from './reconciler.js';
import {delay, http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import {pino} from 'pino';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

describe('constructor', () => {
  it('creates an instance', () => {
    const reconciler = new Reconciler({
      logger: pino(),
    });

    expect(reconciler).toBeInstanceOf(Reconciler);
  });
});

describe('getMatches', () => {
  const server = setupServer(
    http.post('http://localhost/source', async () => {
      await delay(500); // Simulate a call to a remote server
      return HttpResponse.json({
        q1: {
          result: [
            {
              id: 'http://localhost/1234',
              score: 100,
              name: 'Term',
            },
          ],
        },
      });
    })
  );

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('gets matches from the cache if requests are the same', async () => {
    const reconciler = new Reconciler({
      logger: pino(),
    });

    const expectedResponse = [
      {
        endpointUrl: 'http://localhost/source',
        value: 'painting',
        limit: 1,
        scoreOfAtLeast: 0,
        matches: [{id: 'http://localhost/1234', name: 'Term', score: 100}],
      },
    ];

    const options = {
      queries: [
        {
          endpointUrl: 'http://localhost/source',
          value: 'painting',
          limit: 1,
        },
      ],
    };

    // Not from cache
    const startTimeRequest1 = Date.now();
    const matches1 = await reconciler.getMatches(options);
    const endTimeRequest1 = Date.now();
    expect(matches1).toStrictEqual(expectedResponse);
    expect(endTimeRequest1 - startTimeRequest1).toBeGreaterThan(500); // Slow

    // From cache
    const startTimeRequest2 = Date.now();
    const matches2 = await reconciler.getMatches(options);
    const endTimeRequest2 = Date.now();
    expect(matches2).toStrictEqual(expectedResponse);
    expect(endTimeRequest2 - startTimeRequest2).toBeLessThan(5); // Fast
  });
});
