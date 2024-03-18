import type {NlpClient} from './client.js';
import {z} from 'zod';

export enum ContentType {
  Html = 'html',
  Text = 'text',
}

export enum EntityType {
  Date = 'date',
  Event = 'event',
  Location = 'location',
  Organization = 'organization',
  Person = 'person',
  Subject = 'subject',
}

export type Entity = {
  name: string;
  type: EntityType;
};

const constructorOptionsSchema = z.object({
  client: z.any(),
});

export type ConstructorOptions = z.input<typeof constructorOptionsSchema>;

export const getEntitiesOptionsSchema = z.object({
  content: z.string(),
  type: z.nativeEnum(ContentType).default(ContentType.Text),
  languageCode: z.string().optional(),
  options: z
    .object({
      unique: z.boolean().default(true),
    })
    .default({}),
});

export type GetEntitiesOptions = z.input<typeof getEntitiesOptionsSchema>;

export class Extractor {
  private readonly client: NlpClient;

  constructor(options: ConstructorOptions) {
    const opts = constructorOptionsSchema.parse(options);

    if (typeof opts.client.getEntities !== 'function') {
      throw new Error('Client does not implement method "getEntities()"');
    }

    this.client = opts.client;
  }

  // An entity is unique if both the name and the type are unique.
  // If two entities share the same name (e.g. 'bank') but have a
  // different type (e.g. 'subject' and 'location'), they have a different meaning
  private getUniqueEntities(entities: Entity[]) {
    const uniqueEntities = entities.filter((entity, index, array) => {
      const indexOfUniqueEntity = array.findIndex(
        uniqueEntity =>
          uniqueEntity.name === entity.name && uniqueEntity.type === entity.type
      );
      return indexOfUniqueEntity === index;
    });

    return uniqueEntities;
  }

  async getEntities(options: GetEntitiesOptions) {
    const opts = getEntitiesOptionsSchema.parse(options);

    const entities = await this.client.getEntities({
      content: opts.content,
      type: opts.type,
      languageCode: opts.languageCode,
    });

    // TBD: stem entities (e.g. 'tempel' and 'tempels')?
    // https://www.npmjs.com/package/natural, https://www.npmjs.com/package/node-nlp,
    // https://www.npmjs.com/package/@stdlib/nlp

    if (opts.options.unique) {
      return this.getUniqueEntities(entities);
    }

    return entities;
  }
}
