import {EntityWithMatches, Match} from '../search.js';

function Match(props: {match: Match}) {
  const match = props.match;
  return (
    <div class="bg-white rounded-md border border-slate-200 p-8 w-full lg:w-1/3">
      <h5 class="font-bold text-xl mb-2">{match.name}</h5>
      <div class="flex flex-row flex-wrap gap-1 mt-3">
        <span class="inline-flex bg-gray-200 text-xs font-semibold px-4 py-2 rounded-full">
          Relevantie: {match.score}%
        </span>
        <span class="inline-flex bg-gray-200 text-xs font-semibold px-4 py-2 rounded-full">
          {match.source}
        </span>
      </div>
      {match.description && (
        <p class="text-gray-600 text-sm mt-3 line-clamp-3">
          {match.description}
        </p>
      )}
      <p class="mt-3 flex flex-row flex-wrap gap-1">
        <a
          href="javascript:void(0)"
          class="inline-flex items-center px-4 py-2 text-sm text-center text-white bg-black rounded-md hover:bg-gray-700 copy"
          data-clipboard-text={match.id}
        >
          Kopieer IRI
        </a>
        <a
          href={match.id}
          class="inline-flex items-center px-4 py-2 text-sm text-center text-white bg-black rounded-md hover:bg-gray-700"
          target="_blank"
        >
          Bekijk bij bron
        </a>
      </p>
    </div>
  );
}

function Entity(props: {entity: EntityWithMatches}) {
  const entity = props.entity;
  return (
    <>
      <h3 class="text-3xl font-bold pt-8 px-20 text-center">
        Entiteit: {entity.name}
        <span class="ml-2 inline-flex bg-rose-100 text-sm font-semibold px-3 py-1 rounded-full align-top">
          {entity.type}
        </span>
      </h3>
      <div class="flex flex-wrap justify-center mt-5 space-x-0 space-y-4 lg:space-y-0 lg:flex-nowrap lg:space-x-4">
        {entity.matches.map(match => (
          <Match match={match} />
        ))}
      </div>
    </>
  );
}

export function SearchResultList(props: {entities: EntityWithMatches[]}) {
  const entities = props.entities;
  return (
    <>
      <h2 class="text-5xl font-bold pt-10 px-20 text-center tracking-tight">
        Resultaten
      </h2>
      {entities.length === 0 && (
        <p class="mt-5 text-center">Er zijn geen resultaten gevonden</p>
      )}
      {entities.map(entity => (
        <Entity entity={entity} />
      ))}
    </>
  );
}
