import {sourceSettings} from './settings.js';
import {createCache, Cache} from 'async-cache-dedupe';
import fastq from 'fastq';
import got from 'got';
import {setTimeout} from 'node:timers/promises';
import {pino} from 'pino';
import {z} from 'zod';

const constructorOptionsSchema = z.object({
  logger: z.any().refine(val => val !== undefined, {
    message: 'logger must be defined',
  }),
  waitBetweenRequests: z.number().min(0).default(0),
  numberOfConcurrentRequests: z.number().min(1).default(10),
});

export type ConstructorOptions = z.input<typeof constructorOptionsSchema>;

const matchFromReconServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  // Services can return nothing, an empty string (e.g. CHT) or null (e.g. Wikidata); make all of these undefined
  description: z
    .string()
    .nullable()
    .optional()
    .transform(value =>
      value === null || value === undefined || value?.length === 0
        ? undefined
        : value
    ),
});

export type MatchFromReconService = z.infer<typeof matchFromReconServiceSchema>;

const getMatchesFromReconServiceSchema = z.object({
  q1: z.object({
    result: z.array(matchFromReconServiceSchema),
  }),
});

export const querySchema = z.object({
  endpointUrl: z.string().url(),
  value: z.string(),
  limit: z.number().nonnegative().min(1).default(5),
  scoreOfAtLeast: z.number().nonnegative().default(0),
});

export type Query = z.input<typeof querySchema>;

const getMatchesOptionsSchema = z.object({
  queries: z.array(querySchema),
});

export type GetMatchesOptions = z.input<typeof getMatchesOptionsSchema>;

export type Match = Query & {
  matches: MatchFromReconService[];
};

export class Reconciler {
  private readonly logger: pino.Logger;
  private readonly waitBetweenRequests: number;
  private readonly numberOfConcurrentRequests: number;
  private readonly cache: Cache;

  constructor(options: ConstructorOptions) {
    const opts = constructorOptionsSchema.parse(options);

    this.logger = opts.logger;
    this.waitBetweenRequests = opts.waitBetweenRequests;
    this.numberOfConcurrentRequests = opts.numberOfConcurrentRequests;

    // TBD: make configurable? This caching is usefull when using
    // a traditional server, but isn't when using serverless functions
    this.cache = createCache({
      ttl: 86400, // 1 day
      stale: 5, // Number of seconds to return data after ttl has expired
      onHit: (key: string) => this.logger.debug(`Cache hit for ${key}`),
      onMiss: (key: string) => this.logger.debug(`Cache miss for ${key}`),
      storage: {type: 'memory', options: {log: this.logger}},
    });
    this.cache.define(
      'getMatchesFromService',
      this.getMatchesFromService.bind(this)
    );
  }

  private async fetchMatchesFromService(query: Query) {
    this.logger.debug(
      `Reconciling "${query.value}" with "${query.endpointUrl}"`
    );

    // Try not to hurt the reconciliation service or trigger its rate limiter
    await setTimeout(this.waitBetweenRequests);

    // TBD: add context data to request? E.g. if entity type = person,
    // ask the source to look for terms of a similar type
    // TBD: send language code to service? E.g. Wikidate returns texts in different languages

    // https://www.w3.org/community/reports/reconciliation/CG-FINAL-specs-0.2-20230410/#sending-reconciliation-queries-to-a-service
    const rawResponse = await got
      .post(query.endpointUrl, {
        form: {
          queries: JSON.stringify({
            q1: {
              query: query.value,
              limit: query.limit,
            },
          }),
        },
      })
      .json();

    const response = getMatchesFromReconServiceSchema.parse(rawResponse);
    const matches = response.q1.result as MatchFromReconService[];

    return matches;
  }

  private async getMatchesFromService(query: Query) {
    const matches = await this.fetchMatchesFromService(query);

    // Remove excessive matches; some reconciliation services (e.g. Getty) return
    // more than the requested number of matches
    const limitedMatches = matches.slice(0, query.limit);

    // Remove matches with low scores
    let bestMatches = limitedMatches.filter(
      match => match.score >= query.scoreOfAtLeast!
    );

    // Prefix the IDs of the matches with IRIs, if required
    const sourceSetting = sourceSettings[query.endpointUrl];
    if (sourceSetting !== undefined) {
      bestMatches = bestMatches.map(match => {
        const id = sourceSetting.baseIri + match.id;
        return {...match, id};
      });
    }

    return bestMatches;
  }

  async getMatches(options: GetMatchesOptions) {
    const opts = getMatchesOptionsSchema.parse(options);

    const matches: Match[] = [];

    const saveMatchesFromService = async (query: Query) => {
      // @ts-expect-error:TS2339
      const bestMatches = await this.cache.getMatchesFromService(query);

      if (bestMatches.length > 0) {
        matches.push({
          ...query,
          matches: bestMatches,
        });
      }
    };

    const queue = fastq.promise(
      saveMatchesFromService.bind(this),
      this.numberOfConcurrentRequests
    );
    opts.queries.forEach(query =>
      queue.push(query).catch(err => this.logger.error(err))
    );
    await queue.drained();

    return matches;
  }
}
