import {search} from './search.js';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

const server = setupServer(
  http.post('http://example1.org/api/match', () => {
    return HttpResponse.json({
      entities: [
        {
          name: 'Zundert',
          type: 'location',
          matches: [
            {
              endpointUrl: 'http://example.com/1',
              value: 'Zundert',
              limit: 5,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'http://localhost/',
                  name: 'Zundert',
                  score: 76.92,
                },
                {
                  id: 'http://localhost/',
                  name: 'Gemeente Zundert',
                  score: 100,
                },
              ],
            },
          ],
        },
        {
          name: 'Delft',
          type: 'location',
          matches: [
            {
              endpointUrl: 'http://example.com/1',
              value: 'Delft',
              limit: 5,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'http://localhost/',
                  name: 'Delft',
                  score: 90,
                },
              ],
            },
          ],
        },
        {
          name: 'De Tweede Wereldoorlog',
          type: 'event',
          matches: [
            {
              endpointUrl: 'http://example.com/1',
              value: 'De Tweede Wereldoorlog',
              limit: 5,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'http://localhost/',
                  name: 'WO 2',
                  score: 100,
                },
                {
                  id: 'http://localhost/',
                  name: 'Tweede Wereldoorlog',
                  score: 100,
                },
              ],
            },
          ],
        },
      ],
    });
  }),
  http.post('http://example2.org/api/match', () => {
    return HttpResponse.json({
      entities: [
        {
          name: 'Zundert',
          type: 'location',
          matches: [
            {
              endpointUrl: 'http://example.com/1',
              value: 'Zundert',
              limit: 5,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'http://localhost/',
                  name: 'Gemeente Zundert',
                  score: 100,
                },
              ],
            },
          ],
        },
        {
          name: 'Delft',
          type: 'location',
          matches: [
            {
              endpointUrl: 'http://example.com/2',
              value: 'Delft',
              limit: 5,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'http://localhost/',
                  name: 'Delft',
                  score: 100,
                },
              ],
            },
          ],
        },
      ],
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('search', () => {
  it('returns results from one source', async () => {
    const results = await search({
      baseUrl: 'http://example1.org',
      content: 'Just a test', // Doesn't matter for the test
      presets: ['preset1'],
      settings: {
        sourceNames: {
          'http://example.com/1': 'Source 1',
        },
        presets: {
          preset1: {
            location: [
              {
                endpointUrl: 'http://example.com/1',
              },
            ],
            person: [
              {
                endpointUrl: 'http://example.com/1',
              },
            ],
          },
        },
      },
    });

    expect(results).toStrictEqual([
      {
        name: 'De Tweede Wereldoorlog',
        type: 'Gebeurtenis',
        matches: [
          {
            source: 'Source 1',
            id: 'http://localhost/',
            name: 'Tweede Wereldoorlog',
            score: 100,
          },
          {
            source: 'Source 1',
            id: 'http://localhost/',
            name: 'WO 2',
            score: 100,
          },
        ],
      },
      {
        name: 'Delft',
        type: 'Locatie',
        matches: [
          {
            source: 'Source 1',
            id: 'http://localhost/',
            name: 'Delft',
            score: 90,
          },
        ],
      },
      {
        name: 'Zundert',
        type: 'Locatie',
        matches: [
          {
            source: 'Source 1',
            id: 'http://localhost/',
            name: 'Gemeente Zundert',
            score: 100,
          },
          {
            source: 'Source 1',
            id: 'http://localhost/',
            name: 'Zundert',
            score: 76.92,
          },
        ],
      },
    ]);
  });

  it('returns results from multiple sources', async () => {
    const results = await search({
      baseUrl: 'http://example2.org',
      content: 'Just a test', // Doesn't matter for the test
      presets: ['preset1', 'preset2'],
      settings: {
        sourceNames: {
          'http://example.com/1': 'Source 1',
          'http://example.com/2': 'Source 2',
        },
        presets: {
          preset1: {
            location: [
              {
                endpointUrl: 'http://example.com/1',
              },
            ],
          },
          preset2: {
            location: [
              {
                endpointUrl: 'http://example.com/2',
              },
            ],
          },
        },
      },
    });

    expect(results).toStrictEqual([
      {
        name: 'Delft',
        type: 'Locatie',
        matches: [
          {
            source: 'Source 2',
            id: 'http://localhost/',
            name: 'Delft',
            score: 100,
          },
        ],
      },
      {
        name: 'Zundert',
        type: 'Locatie',
        matches: [
          {
            source: 'Source 1',
            id: 'http://localhost/',
            name: 'Gemeente Zundert',
            score: 100,
          },
        ],
      },
    ]);
  });
});
