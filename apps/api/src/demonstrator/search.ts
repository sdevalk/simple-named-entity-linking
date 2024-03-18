import {type MatchResponse} from '../api/app.js';
import {EntityType} from '@snel/extractor';
import {ReconciledEntity} from '@snel/matcher';
import {Match as ReconciliationMatch} from '@snel/reconciler';
import {defu} from 'defu';
import got from 'got';
import {z} from 'zod';

export type Match = {
  source: string;
  id: string;
  name: string;
  score: number;
  description?: string;
};

export type EntityWithMatches = {
  name: string;
  type: string;
  matches: Match[];
};

const searchOptionsSchema = z.object({
  baseUrl: z.string(),
  content: z.string(),
  presets: z.array(z.string()),
  settings: z.object({
    sourceNames: z.record(z.string(), z.string()),
    presets: z.record(
      z.string(),
      z.record(
        z.string(),
        z.array(
          z.object({
            endpointUrl: z.string(),
            limit: z.number().optional(),
            scoreOfAtLeast: z.number().optional(),
          })
        )
      )
    ),
  }),
});

export type SearchOptions = z.input<typeof searchOptionsSchema>;

const entityNames: Record<EntityType, string> = {
  date: 'Datum',
  event: 'Gebeurtenis',
  location: 'Locatie',
  organization: 'Organisatie',
  person: 'Persoon',
  subject: 'Onderwerp',
};

function sort(entities: EntityWithMatches[]) {
  // Sort entities by type
  entities.sort((entityA, entityB) => {
    const result = entityA.type.localeCompare(entityB.type);
    if (result !== 0) {
      return result;
    }

    // The types are identical, now sort by name
    return entityA.name.localeCompare(entityB.name);
  });

  // Sort matches by score
  const sortedEntities = entities.map(entity => {
    entity.matches.sort((matchA, matchB) => {
      const result = matchB.score - matchA.score;
      if (result !== 0) {
        return result;
      }

      // The scores are identical, now sort by name
      return matchA.name.localeCompare(matchB.name);
    });

    return entity;
  });

  return sortedEntities;
}

// Transform the API response into a model that works for presentation
function toSearchResult(
  matchResponse: MatchResponse,
  sourceNames: SearchOptions['settings']['sourceNames']
) {
  const entities = matchResponse.entities.reduce(
    (entities: EntityWithMatches[], entity: ReconciledEntity) => {
      const entityWithMatches: EntityWithMatches = {
        name: entity.name,
        type: entityNames[entity.type],
        matches: entity.matches
          .map((reconciliationMatch: ReconciliationMatch) => {
            const sourceName = sourceNames[reconciliationMatch.endpointUrl];
            return reconciliationMatch.matches.map(matchFromReconService => {
              return {
                source: sourceName,
                ...matchFromReconService,
              };
            });
          })
          .flat(),
      };

      entities.push(entityWithMatches);

      return entities;
    },
    []
  );

  const sortedEntities = sort(entities);

  return sortedEntities;
}

export async function search(options: SearchOptions) {
  const opts = searchOptionsSchema.parse(options);

  // Get the sources of the selected presets and merge these
  const sources = opts.presets.reduce((sources, preset: string) => {
    const settings = opts.settings.presets[preset];
    return defu(settings, sources);
  }, {});

  const matchResponse = await got
    .post(`${opts.baseUrl}/api/match`, {
      json: {
        content: opts.content,
        reconciliation: {
          sources,
        },
      },
    })
    .json<MatchResponse>();

  const entities = toSearchResult(matchResponse, opts.settings.sourceNames);

  return entities;
}
