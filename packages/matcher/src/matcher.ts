import {ContentType, Entity, EntityType, Extractor} from '@snel/extractor';
import {querySchema, Match, Query, Reconciler} from '@snel/reconciler';
import {pino} from 'pino';
import {z} from 'zod';

const constructorOptionsSchema = z.object({
  logger: z.any().refine(val => val !== undefined, {
    message: 'logger must be defined',
  }),
  extractor: z.instanceof(Extractor),
  reconciler: z.instanceof(Reconciler),
});

export type ConstructorOptions = z.input<typeof constructorOptionsSchema>;

const querySchemaWithoutValue = querySchema.omit({value: true});

export const getMatchesOptionsSchema = z.object({
  content: z.string().min(50).max(5000), // TBD: the right limits?
  type: z.nativeEnum(ContentType).optional(),
  languageCode: z.string().optional(),
  reconciliation: z.object({
    sources: z.record(
      z.nativeEnum(EntityType),
      z.array(querySchemaWithoutValue)
    ),
  }),
});

export type GetMatchesOptions = z.input<typeof getMatchesOptionsSchema>;

export type ReconciledEntity = Entity & {
  matches: Match[];
};

export class Matcher {
  private readonly logger: pino.Logger;
  private readonly extractor: Extractor;
  private readonly reconciler: Reconciler;

  constructor(options: ConstructorOptions) {
    const opts = constructorOptionsSchema.parse(options);

    this.logger = opts.logger;
    this.extractor = opts.extractor;
    this.reconciler = opts.reconciler;
  }

  private getReconcilableEntities(
    options: GetMatchesOptions,
    entities: Entity[]
  ) {
    const reconcilableEntities = entities.filter(entity => {
      const settingsForSources = options.reconciliation.sources[entity.type]!;
      if (settingsForSources !== undefined) {
        return true;
      }

      this.logger.debug(
        `Not reconciling "${entity.name}": no source defined for its type, "${entity.type}"`
      );
      return false;
    });

    return reconcilableEntities;
  }

  private createReconciliationQueriesFromEntities(
    options: GetMatchesOptions,
    entities: Entity[]
  ) {
    const queries: Query[][] = entities.map(entity => {
      const settingsForSources = options.reconciliation.sources[entity.type]!;
      const queriesOfEntity = settingsForSources.map(settings => {
        const query: Query = {
          ...settings,
          value: entity.name,
        };
        return query;
      });
      return queriesOfEntity;
    });

    const queriesForReconciliation = queries.flat();

    return queriesForReconciliation;
  }

  // Only return entities that have reconciliation matches
  private getReconciledEntities(
    options: GetMatchesOptions,
    entities: Entity[],
    matches: Match[]
  ) {
    const reconciledEntities = entities.reduce(
      (reconciledEntities: ReconciledEntity[], entity) => {
        const settingsForSources = options.reconciliation.sources[entity.type]!;

        const sourceOfMatchBelongsToEntityType = (match: Match) =>
          settingsForSources.some(
            settings => match.endpointUrl === settings.endpointUrl
          );

        const matchesForEntity = matches.filter(
          match =>
            match.value === entity.name &&
            sourceOfMatchBelongsToEntityType(match)
        );

        if (matchesForEntity.length > 0) {
          reconciledEntities.push({
            name: entity.name,
            type: entity.type,
            matches: matchesForEntity,
          });
        }
        return reconciledEntities;
      },
      []
    );

    return reconciledEntities;
  }

  async getMatches(options: GetMatchesOptions) {
    const opts = getMatchesOptionsSchema.parse(options);

    const entities = await this.extractor.getEntities(opts);
    const reconcilableEntities = this.getReconcilableEntities(opts, entities);
    const queries = this.createReconciliationQueriesFromEntities(
      opts,
      reconcilableEntities
    );
    const matches = await this.reconciler.getMatches({queries});
    const reconciledEntities = this.getReconciledEntities(
      opts,
      reconcilableEntities,
      matches
    );

    return reconciledEntities;
  }
}
