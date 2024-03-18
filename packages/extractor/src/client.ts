import {getEntitiesOptionsSchema, Entity} from './extractor.js';
import {z} from 'zod';

export const getEntitiesClientOptionsSchema = getEntitiesOptionsSchema.pick({
  content: true,
  type: true,
  languageCode: true,
});

export type GetEntitiesClientOptions = z.input<
  typeof getEntitiesClientOptionsSchema
>;

export abstract class NlpClient {
  abstract getEntities(options: GetEntitiesClientOptions): Promise<Entity[]>;
}
