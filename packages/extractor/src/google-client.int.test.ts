import {EntityType} from './extractor.js';
import {GoogleNlpClient} from './google-client.js';
import {env} from 'node:process';
import {describe, expect, it} from 'vitest';

describe('getEntities', () => {
  const client = new GoogleNlpClient({
    credentials: {
      email: env.GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_EMAIL as string,
      privateKey: env.GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_PRIVATE_KEY as string,
    },
  });

  it('gets entities', async () => {
    const entities = await client.getEntities({
      content:
        'Jan de Vries, geboren op 4 april 1921, groeide op in Rotterdam. Het centrum van de stad werd in de Tweede Wereldoorlog zwaar getroffen door een bombardement van de Duitse invallers, waarbij 711 mensen omkwamen.',
    });

    expect(entities).toEqual(
      expect.arrayContaining([
        {name: '4 april 1921', type: EntityType.Date},
        {name: 'Duitse', type: EntityType.Location},
        {name: 'Jan de Vries', type: EntityType.Person},
        {name: 'Rotterdam', type: EntityType.Location},
        {name: 'Tweede Wereldoorlog', type: EntityType.Event},
        {name: 'bombardement', type: 'event'},
        {name: 'centrum', type: EntityType.Location},
        {name: 'invallers', type: EntityType.Person},
        {name: 'mensen', type: EntityType.Person},
        {name: 'stad', type: EntityType.Location},
      ])
    );
  });
});
