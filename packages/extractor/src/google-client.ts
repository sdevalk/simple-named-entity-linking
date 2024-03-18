import {
  getEntitiesClientOptionsSchema,
  GetEntitiesClientOptions,
  NlpClient,
} from './client.js';
import {ContentType, EntityType, Entity} from './extractor.js';
import {v2, protos} from '@google-cloud/language';
import {z} from 'zod';

const constructorOptionsSchema = z.object({
  credentials: z.object({
    email: z.string(),
    privateKey: z.string(),
  }),
});

export type GoogleNlpClientConstructorOptions = z.input<
  typeof constructorOptionsSchema
>;

// First element in the array must be of a specific type, the rest does not
const getEntitiesResponseSchema = z
  .tuple([
    z.object({
      entities: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
        })
      ),
    }),
  ])
  .rest(z.any());

const contentTypeToLanguageServiceType = new Map<
  ContentType,
  protos.google.cloud.language.v2.Document.Type
>([
  [ContentType.Html, protos.google.cloud.language.v2.Document.Type.HTML],
  [ContentType.Text, protos.google.cloud.language.v2.Document.Type.PLAIN_TEXT],
]);

// Currently supported types. Google has more (e.g. 'NUMBER', 'WORK_OF_ART')
const languageServiceTypeToEntityType = new Map<string, EntityType>([
  ['DATE', EntityType.Date],
  ['EVENT', EntityType.Event],
  ['LOCATION', EntityType.Location],
  ['ORGANIZATION', EntityType.Organization],
  ['OTHER', EntityType.Subject], // Not the same, but seems to suffice
  ['PERSON', EntityType.Person],
]);

export class GoogleNlpClient implements NlpClient {
  private readonly languageClient: v2.LanguageServiceClient;

  constructor(options: GoogleNlpClientConstructorOptions) {
    const opts = constructorOptionsSchema.parse(options);

    // The private key contains newlines that aren't transmitted correctly
    // when passed via an env variable. Correct these now
    const privateKey = opts.credentials.privateKey.replace(/\\n/g, '\n');

    this.languageClient = new v2.LanguageServiceClient({
      credentials: {
        client_email: opts.credentials.email,
        private_key: privateKey,
      },
    });
  }

  async getEntities(options: GetEntitiesClientOptions) {
    const opts = getEntitiesClientOptionsSchema.parse(options);

    const request: protos.google.cloud.language.v2.IAnalyzeEntitiesRequest = {
      document: {
        content: opts.content,
        type: contentTypeToLanguageServiceType.get(opts.type),
        languageCode: opts.languageCode,
      },
    };

    const rawResponse = await this.languageClient.analyzeEntities(request);
    const response = getEntitiesResponseSchema.parse(rawResponse);
    const rawEntities = response[0].entities;

    // Collect the entities of types supported by the extractor
    const entities = rawEntities.reduce((entities: Entity[], rawEntity) => {
      const type = languageServiceTypeToEntityType.get(rawEntity.type);
      if (type !== undefined) {
        entities.push({name: rawEntity.name, type});
      }
      return entities;
    }, []);

    // TBD: change entities with types 'location' and 'person' to 'subject'
    // if their names do not start with an uppercase letter,
    // e.g. 'dorp', 'centrum', 'mensen' or 'goden'?

    return entities;
  }
}
