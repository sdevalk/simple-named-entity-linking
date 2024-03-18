import {Reconciler} from './reconciler.js';
import {pino} from 'pino';
import {describe, expect, it} from 'vitest';

describe('getMatches', () => {
  const reconciler = new Reconciler({
    logger: pino(),
  });

  it('returns an empty array if query does not match', async () => {
    const matches = await reconciler.getMatches({
      queries: [
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'unknown',
        },
      ],
    });

    expect(matches).toEqual([]);
  });

  it('gets matches with the requested limit', async () => {
    const matches = await reconciler.getMatches({
      queries: [
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'fiets',
          limit: 2,
        },
      ],
    });

    expect(matches).toEqual([
      {
        endpointUrl:
          'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
        value: 'fiets',
        limit: 2,
        scoreOfAtLeast: 0,
        matches: [
          {
            id: 'https://data.cultureelerfgoed.nl/term/id/cht/89ce4158-8aaf-4ace-b023-6105d23dbfa6',
            name: 'fietsen',
            score: 100,
            description: 'fiets • rijwiel • rijwielen',
          },
          {
            id: 'https://data.cultureelerfgoed.nl/term/id/cht/a3c687c8-a1b9-4664-b3ed-4d0240ee32e9',
            name: 'bakfietsen',
            score: 72.73,
            description: 'bakfiets',
          },
        ],
      },
    ]);
  });

  it('gets matches with the requested minimum score', async () => {
    const matches = await reconciler.getMatches({
      queries: [
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'fiets',
          scoreOfAtLeast: 70,
        },
      ],
    });

    expect(matches).toEqual([
      {
        endpointUrl:
          'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
        value: 'fiets',
        limit: 5,
        scoreOfAtLeast: 70,
        matches: [
          {
            id: 'https://data.cultureelerfgoed.nl/term/id/cht/89ce4158-8aaf-4ace-b023-6105d23dbfa6',
            name: 'fietsen',
            score: 100,
            description: 'fiets • rijwiel • rijwielen',
          },
          {
            id: 'https://data.cultureelerfgoed.nl/term/id/cht/a3c687c8-a1b9-4664-b3ed-4d0240ee32e9',
            name: 'bakfietsen',
            score: 72.73,
            description: 'bakfiets',
          },
          {
            id: 'https://data.cultureelerfgoed.nl/term/id/cht/57b18bd5-3e7b-48d8-a8ca-292c3e2b261a',
            name: 'fietsbellen',
            score: 72.73,
            description: 'fietsbel',
          },
          {
            id: 'https://data.cultureelerfgoed.nl/term/id/cht/96c0d260-1cc1-42cb-8e66-d3bfb1af3b69',
            name: 'fietsmoffen',
            score: 72.73,
            description: 'fietsmof',
          },
        ],
      },
    ]);
  });

  it('gets matches from one source with different query settings', async () => {
    const matches = await reconciler.getMatches({
      queries: [
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'fiets',
          limit: 2,
          scoreOfAtLeast: 70,
        },
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'auto',
          limit: 3,
          scoreOfAtLeast: 66,
        },
      ],
    });

    // Ignore order of elements in the array
    expect(matches).toEqual(
      expect.arrayContaining([
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'fiets',
          limit: 2,
          scoreOfAtLeast: 70,
          matches: [
            {
              id: 'https://data.cultureelerfgoed.nl/term/id/cht/89ce4158-8aaf-4ace-b023-6105d23dbfa6',
              name: 'fietsen',
              score: 100,
              description: 'fiets • rijwiel • rijwielen',
            },
            {
              id: 'https://data.cultureelerfgoed.nl/term/id/cht/a3c687c8-a1b9-4664-b3ed-4d0240ee32e9',
              name: 'bakfietsen',
              score: 72.73,
              description: 'bakfiets',
            },
          ],
        },
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'auto',
          limit: 3,
          scoreOfAtLeast: 66,
          matches: [
            {
              id: 'https://data.cultureelerfgoed.nl/term/id/cht/dec3cb60-0105-49ac-a19f-d52c1f1ac5b4',
              name: "auto's",
              score: 100,
              description: 'auto • automobiel • automobielen',
            },
            {
              id: 'https://data.cultureelerfgoed.nl/term/id/cht/d163dd06-173b-4a3c-8d28-659cd737a377',
              name: 'autolak',
              score: 66.67,
            },
            {
              id: 'https://data.cultureelerfgoed.nl/term/id/cht/17c82e38-caa5-4832-a143-25843177ef78',
              name: 'autopeds',
              score: 66.67,
              description: 'autoped',
            },
          ],
        },
      ])
    );
  });

  it('gets matches from multiple sources with different query settings', async () => {
    const matches = await reconciler.getMatches({
      queries: [
        {
          endpointUrl: 'https://services.getty.edu/vocab/reconcile/',
          value: 'fiets',
          limit: 1,
          scoreOfAtLeast: 25,
        },
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'leerlooierij',
          limit: 2,
          scoreOfAtLeast: 85,
        },
        {
          endpointUrl: 'https://wikidata.reconci.link/nl/api',
          value: 'Amsterdam',
          limit: 3,
          scoreOfAtLeast: 100,
        },
      ],
    });

    // Ignore order of elements in the array
    expect(matches).toEqual(
      expect.arrayContaining([
        {
          endpointUrl:
            'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
          value: 'leerlooierij',
          limit: 2,
          scoreOfAtLeast: 85,
          matches: [
            {
              id: 'https://data.cultureelerfgoed.nl/term/id/cht/f7b6a148-ab0e-449e-9110-0f9ed770c54c',
              name: 'leerlooierijen',
              score: 100,
              description: 'leerlooierij',
            },
            {
              id: 'https://data.cultureelerfgoed.nl/term/id/cht/c4d9b406-d416-49c7-af2e-a0f9e0890257',
              name: 'witleerlooierijen',
              score: 88,
              description: 'witleerlooierij',
            },
          ],
        },
        {
          endpointUrl: 'https://services.getty.edu/vocab/reconcile/',
          value: 'fiets',
          limit: 1,
          scoreOfAtLeast: 25,
          matches: [
            {
              id: 'http://vocab.getty.edu/aat/300212636',
              name: 'bicycles',
              score: expect.any(Number), // Score changes frequently
            },
          ],
        },
        {
          endpointUrl: 'https://wikidata.reconci.link/nl/api',
          value: 'Amsterdam',
          limit: 3,
          scoreOfAtLeast: 100,
          matches: [
            {
              id: 'http://www.wikidata.org/entity/Q727',
              name: 'Amsterdam',
              score: 100,
              description: 'hoofdstad van Nederland, Noord-Holland',
            },
            {
              id: 'http://www.wikidata.org/entity/Q9899',
              name: 'Amsterdam',
              score: 100,
              description: 'gemeente in Noord-Holland, Nederland',
            },
            {
              id: 'http://www.wikidata.org/entity/Q478456',
              name: 'Amsterdam',
              score: 100,
              description: 'stad in New York',
            },
          ],
        },
      ])
    );
  });
});
