import {Matcher} from './matcher.js';
import {EntityType, Extractor, GoogleNlpClient} from '@snel/extractor';
import {Reconciler} from '@snel/reconciler';
import {env} from 'node:process';
import {pino} from 'pino';
import {describe, expect, it} from 'vitest';

const logger = pino();

const client = new GoogleNlpClient({
  credentials: {
    email: env.GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_EMAIL as string,
    privateKey: env.GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_PRIVATE_KEY as string,
  },
});

const extractor = new Extractor({client});
const reconciler = new Reconciler({logger});
const matcher = new Matcher({logger, extractor, reconciler});

describe('getMatches', () => {
  it('gets reconciled entities from one source', async () => {
    const reconciledEntities = await matcher.getMatches({
      content:
        'Koos Aarts groeide op in Dongen, een dorp dat sterk in opkomst was als centrum van schoenmakerij en leerlooierij.',
      reconciliation: {
        sources: {
          [EntityType.Subject]: [
            {
              endpointUrl:
                'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
              limit: 1,
            },
          ],
        },
      },
    });

    expect(reconciledEntities).toStrictEqual([
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
    ]);
  });

  it('gets reconciled entities from multiple sources', async () => {
    const reconciledEntities = await matcher.getMatches({
      content:
        'Koos Aarts groeide op in Dongen, een dorp dat sterk in opkomst was als centrum van schoenmakerij en leerlooierij.',
      reconciliation: {
        sources: {
          [EntityType.Subject]: [
            {
              endpointUrl:
                'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
              limit: 1,
            },
            {
              endpointUrl:
                'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/http://vocab.getty.edu/aat/sparql',
              limit: 1,
            },
          ],
        },
      },
    });

    // Ignore order of elements in the array
    expect(reconciledEntities).toEqual(
      expect.arrayContaining([
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
            {
              endpointUrl:
                'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/http://vocab.getty.edu/aat/sparql',
              value: 'leerlooierij',
              limit: 1,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'http://vocab.getty.edu/aat/300006302',
                  name: 'leerlooierijen',
                  score: 100,
                  description:
                    'leerlooierij • leerfabriek • leerfabrieken • kuiplooierij • kuiplooierijen • looierijgebouwen • looierijgebouw • looierij • looierijen',
                },
              ],
            },
          ],
        },
        {
          name: 'opkomst',
          type: 'subject',
          matches: [
            {
              endpointUrl:
                'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/http://vocab.getty.edu/aat/sparql',
              value: 'opkomst',
              limit: 1,
              scoreOfAtLeast: 0,
              matches: [
                {
                  id: 'http://vocab.getty.edu/aat/300393182',
                  name: 'ontstaan',
                  score: 100,
                  description: 'opkomst',
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
                },
              ],
            },
          ],
        },
      ])
    );
  });
});
