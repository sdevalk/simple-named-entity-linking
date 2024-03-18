import {NlpClient} from './client.js';
import {Entity, EntityType, Extractor} from './extractor.js';
import {describe, expect, it} from 'vitest';

class DummyNlpClient implements NlpClient {
  async getEntities() {
    const entities: Entity[] = [
      {
        name: 'Koos Aarts',
        type: EntityType.Person,
      },
      {
        name: 'Dongen',
        type: EntityType.Location,
      },
      {
        name: 'Dongen',
        type: EntityType.Location,
      },
    ];

    return entities;
  }
}

const client = new DummyNlpClient();

describe('constructor', () => {
  it('throws if options are invalid', () => {
    expect(() => new Extractor({client: 'badValue'})).toThrow(
      'Client does not implement method "getEntities()"'
    );
  });

  it('creates an instance', () => {
    const extractor = new Extractor({client});

    expect(extractor).toBeInstanceOf(Extractor);
  });
});

describe('getEntities', () => {
  const extractor = new Extractor({client});

  it('gets unique entities', async () => {
    const entities = await extractor.getEntities({
      content: '', // Doesn't matter for the test
      options: {
        unique: true,
      },
    });

    expect(entities).toStrictEqual([
      {name: 'Koos Aarts', type: EntityType.Person},
      {name: 'Dongen', type: EntityType.Location},
    ]);
  });

  it('gets non-unique entities', async () => {
    const entities = await extractor.getEntities({
      content: '', // Doesn't matter for the test
      options: {
        unique: false,
      },
    });

    expect(entities).toStrictEqual([
      {name: 'Koos Aarts', type: EntityType.Person},
      {name: 'Dongen', type: EntityType.Location},
      {name: 'Dongen', type: EntityType.Location},
    ]);
  });
});
