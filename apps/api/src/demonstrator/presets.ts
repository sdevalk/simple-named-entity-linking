const AAT =
  'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/http://vocab.getty.edu/aat/sparql';
const BRABANTSE_GEBOUWEN =
  'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.brabantcloud.nl/gebouwen/query/';
const CHT =
  'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht';
const GEONAMES =
  'https://termennetwerk-api.netwerkdigitaalerfgoed.nl/reconcile/https://demo.netwerkdigitaalerfgoed.nl/geonames';
const WIKIDATA = 'https://wikidata.reconci.link/nl/api';

export const sourceNames = {
  [AAT]: 'Art & Architecture Thesaurus',
  [BRABANTSE_GEBOUWEN]: 'Brabantse Gebouwen',
  [GEONAMES]: 'GeoNames',
  [CHT]: 'Cultuurhistorische Thesaurus',
  [WIKIDATA]: 'Wikidata',
};

export const presetNames = {
  preset1: 'Alle soorten entiteiten in Wikidata',
  preset5: 'Locaties in GeoNames (Nederland, België en Duitsland)',
  preset2: 'Onderwerpen in Art & Architecture Thesaurus',
  preset3: 'Onderwerpen in Cultuurhistorische Thesaurus',
  preset4: 'Religieuze gebouwen in Brabantse Gebouwen',
};

export type Preset = {
  [type: string]: {
    endpointUrl: string;
    limit?: number;
    scoreOfAtLeast?: number;
  }[];
};

export type Presets = {
  [name: string]: Preset;
};

export const presets: Presets = {
  preset1: {
    date: [
      {
        endpointUrl: WIKIDATA,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
    event: [
      {
        endpointUrl: WIKIDATA,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
    location: [
      {
        endpointUrl: WIKIDATA,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
    subject: [
      {
        endpointUrl: WIKIDATA,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
    organization: [
      {
        endpointUrl: WIKIDATA,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
    person: [
      {
        endpointUrl: WIKIDATA,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
  },
  preset2: {
    subject: [
      {
        endpointUrl: AAT,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
  },
  preset3: {
    subject: [
      {
        endpointUrl: CHT,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
  },
  preset4: {
    location: [
      {
        endpointUrl: BRABANTSE_GEBOUWEN,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
  },
  preset5: {
    location: [
      {
        endpointUrl: GEONAMES,
        limit: 3,
        scoreOfAtLeast: 90,
      },
    ],
  },
};
