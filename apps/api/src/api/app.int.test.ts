import {app} from './app.js';
import {describe, expect, it} from 'vitest';

describe('extract', () => {
  it('extracts entities', async () => {
    const req = new Request('http://localhost/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content:
          'Koos Aarts groeide op in Dongen, een dorp dat sterk in opkomst was als centrum van schoenmakerij en leerlooierij.',
      }),
    });
    const res = await app.request(req);

    expect(res).not.toBeNull();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      entities: [
        {name: 'Dongen', type: 'location'},
        {name: 'Koos Aarts', type: 'person'},
        {name: 'centrum', type: 'location'},
        {name: 'dorp', type: 'location'},
        {name: 'leerlooierij', type: 'subject'},
        {name: 'opkomst', type: 'subject'},
        {name: 'schoenmakerij', type: 'subject'},
      ],
    });
  });
});

describe('match', () => {
  it('matches entities', async () => {
    const req = new Request('http://localhost/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content:
          'Koos Aarts groeide op in Dongen, een dorp dat sterk in opkomst was als centrum van schoenmakerij en leerlooierij.',
        reconciliation: {
          sources: {
            subject: [
              {
                endpointUrl:
                  'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
                limit: 1,
              },
            ],
          },
        },
      }),
    });
    const res = await app.request(req);

    expect(res).not.toBeNull();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      entities: [
        {
          name: 'leerlooierij',
          type: 'subject',
          matches: [
            {
              endpointUrl:
                'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
              value: 'leerlooierij',
              limit: 1,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'https://data.cultureelerfgoed.nl/term/id/cht/f7b6a148-ab0e-449e-9110-0f9ed770c54c',
                  name: 'leerlooierijen',
                  score: 100,
                  description: 'leerlooierij',
                },
              ],
            },
          ],
        },
        {
          name: 'schoenmakerij',
          type: 'subject',
          matches: [
            {
              endpointUrl:
                'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
              value: 'schoenmakerij',
              limit: 1,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'https://data.cultureelerfgoed.nl/term/id/cht/34bb1229-bd69-4a84-9d07-6d65ca861849',
                  name: 'schoenmakerijen',
                  score: 92.31,
                  description: undefined,
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
