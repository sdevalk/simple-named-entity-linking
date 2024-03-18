import {Error} from './components/error.js';
import {SearchForm} from './components/form.js';
import {SearchResultList} from './components/results.js';
import {presets, sourceNames} from './presets.js';
import {search} from './search.js';
import {zValidator} from '@hono/zod-validator';
import {Hono} from 'hono';
import {env} from 'hono/adapter';
import {URL} from 'url';
import {z} from 'zod';

export const app = new Hono();

app.onError((err, c) => {
  console.error(err);
  return c.html(<Error message="Er is een applicatiefout opgetreden" />, 500);
});

app.get('/', c => c.html(<SearchForm />));

app.post(
  '/results',
  zValidator(
    'form',
    z.object({
      content: z.string().min(50).max(5000),
      presets: z.string(),
    }),
    // @ts-expect-error:TS7030
    (result, c) => {
      if (!result.success) {
        return c.html(
          <Error message="De invoer is niet geldig. Controleer het formulier" />,
          400
        );
      }
    }
  ),
  async c => {
    const body = await c.req.parseBody({all: true});
    const content = body.content as string;
    const selectedPresets = (
      Array.isArray(body.presets) ? body.presets : [body.presets]
    ) as string[];

    const snelEnv = env<{SNEL_API_ENDPOINT_URL: string | undefined}>(c);
    let baseUrl = snelEnv.SNEL_API_ENDPOINT_URL;

    // Call self
    if (!baseUrl) {
      const url = new URL(c.req.url);
      baseUrl = `${url.protocol}//${url.host}`;
    }

    const entities = await search({
      baseUrl,
      content,
      presets: selectedPresets,
      settings: {
        sourceNames,
        presets,
      },
    });

    return c.html(<SearchResultList entities={entities} />);
  }
);
