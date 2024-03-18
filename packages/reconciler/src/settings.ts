export type SourceSettings = {
  [endpointUrl: string]: {
    baseIri: string;
  };
};

// Hard-coded settings that always apply to certain sources
export const sourceSettings: SourceSettings = {
  'https://services.getty.edu/vocab/reconcile/': {
    baseIri: 'http://vocab.getty.edu/',
  },
  'https://wikidata.reconci.link/nl/api': {
    baseIri: 'http://www.wikidata.org/entity/',
  },
};
