import {middleware} from './middleware.js';
import {zValidator} from '@hono/zod-validator';
import {getEntitiesOptionsSchema, type Entity} from '@snel/extractor';
import {getMatchesOptionsSchema, type ReconciledEntity} from '@snel/matcher';
import {Hono} from 'hono';

export type ExtractResponse = {
  entities: Entity[];
};

export type MatchResponse = {
  entities: ReconciledEntity[];
};

export const app = new Hono();

app.use('*', middleware());

app.post('/extract', zValidator('json', getEntitiesOptionsSchema), async c => {
  const options = c.req.valid('json');
  const extractor = c.get('extractor');
  const entities = await extractor.getEntities(options);
  const response: ExtractResponse = {entities};
  return c.json(response);
});

app.post('/match', zValidator('json', getMatchesOptionsSchema), async c => {
  const options = c.req.valid('json');
  const matcher = c.get('matcher');
  const entities = await matcher.getMatches(options);
  const response: MatchResponse = {entities};
  return c.json(response);
});
