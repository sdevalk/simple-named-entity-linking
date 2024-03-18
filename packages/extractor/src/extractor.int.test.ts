import {EntityType, Extractor} from './extractor.js';
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

  const extractor = new Extractor({client});

  it('gets entities', async () => {
    const entities = await extractor.getEntities({
      content:
        'Koos Aarts groeide op in Dongen, een dorp dat sterk in opkomst was als centrum van schoenmakerij en leerlooierij.',
    });

    expect(entities).toEqual(
      expect.arrayContaining([
        {name: 'Dongen', type: EntityType.Location},
        {name: 'Koos Aarts', type: EntityType.Person},
        {name: 'centrum', type: EntityType.Location},
        {name: 'dorp', type: EntityType.Location},
        {name: 'leerlooierij', type: EntityType.Subject},
        {name: 'opkomst', type: EntityType.Subject},
        {name: 'schoenmakerij', type: EntityType.Subject},
      ])
    );
  });

  it('gets unique entities', async () => {
    const entities = await extractor.getEntities({
      content: `De inscriptie op de versierde steen stelt dat de steen aan haar gewijd is door “de vereerders van haar tempel”.
        De stenen van Flavus en van Sandraudiga laten zien dat niet alleen de Keltische goden werden beïnvloed door de Romeinse godenwereld, maar ook Romeinse rituelen werden overgenomen.
        Overigens werden de Romeinen ook beïnvloed door lokale gebruiken. Romeinen die zich in een regio vestigden, offerden in dezelfde tempels aan de dezelfde gelijkgestelde goden als de lokale bevolking.`,
      options: {
        unique: true,
      },
    });

    expect(entities).toStrictEqual([
      {name: 'Flavus', type: EntityType.Person},
      {name: 'Keltische', type: EntityType.Location},
      {name: 'Romeinen', type: EntityType.Person},
      {name: 'Romeinse', type: EntityType.Location},
      {name: 'Sandraudiga', type: EntityType.Person},
      {name: 'bevolking', type: EntityType.Person},
      {name: 'gebruiken', type: EntityType.Subject},
      {name: 'goden', type: EntityType.Person},
      {name: 'godenwereld', type: EntityType.Subject},
      {name: 'regio', type: EntityType.Location},
      {name: 'rituelen', type: EntityType.Subject},
      {name: 'steen', type: EntityType.Subject},
      {name: 'stenen', type: EntityType.Subject},
      {name: 'tempel', type: EntityType.Location},
      {name: 'tempels', type: EntityType.Location},
      {name: 'vereerders', type: EntityType.Person},
    ]);
  });

  it('gets non-unique entities', async () => {
    const entities = await extractor.getEntities({
      content: `De inscriptie op de versierde steen stelt dat de steen aan haar gewijd is door “de vereerders van haar tempel”.
        De stenen van Flavus en van Sandraudiga laten zien dat niet alleen de Keltische goden werden beïnvloed door de Romeinse godenwereld, maar ook Romeinse rituelen werden overgenomen.
        Overigens werden de Romeinen ook beïnvloed door lokale gebruiken. Romeinen die zich in een regio vestigden, offerden in dezelfde tempels aan de dezelfde gelijkgestelde goden als de lokale bevolking.`,
      options: {
        unique: false,
      },
    });

    expect(entities).toStrictEqual([
      {name: 'Flavus', type: EntityType.Person},
      {name: 'Keltische', type: EntityType.Location},
      {name: 'Romeinen', type: EntityType.Person},
      {name: 'Romeinse', type: EntityType.Location},
      {name: 'Sandraudiga', type: EntityType.Person},
      {name: 'bevolking', type: EntityType.Person},
      {name: 'gebruiken', type: EntityType.Subject},
      {name: 'goden', type: EntityType.Person},
      {name: 'goden', type: EntityType.Person},
      {name: 'godenwereld', type: EntityType.Subject},
      {name: 'regio', type: EntityType.Location},
      {name: 'rituelen', type: EntityType.Subject},
      {name: 'steen', type: EntityType.Subject},
      {name: 'stenen', type: EntityType.Subject},
      {name: 'tempel', type: EntityType.Location},
      {name: 'tempels', type: EntityType.Location},
      {name: 'vereerders', type: EntityType.Person},
    ]);
  });
});
