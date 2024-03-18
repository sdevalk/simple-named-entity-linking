import {Extractor, GoogleNlpClient} from '@snel/extractor';
import {Matcher} from '@snel/matcher';
import {Reconciler} from '@snel/reconciler';
import type {MiddlewareHandler} from 'hono';
import {env} from 'hono/adapter';
import {pino} from 'pino';

declare module 'hono' {
  interface ContextVariableMap {
    extractor: Extractor;
    matcher: Matcher;
  }
}

type SnelEnv = {
  GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_EMAIL: string;
  GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_PRIVATE_KEY: string;
};

export const middleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const snelEnv = env<SnelEnv>(c);
    const googleApiEmail = snelEnv.GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_EMAIL;
    const googleApiPrivateKey =
      snelEnv.GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_PRIVATE_KEY;

    const logger = pino();
    const client = new GoogleNlpClient({
      credentials: {
        email: googleApiEmail,
        privateKey: googleApiPrivateKey,
      },
    });
    const extractor = new Extractor({client});
    const reconciler = new Reconciler({logger});
    const matcher = new Matcher({logger, extractor, reconciler});

    c.set('extractor', extractor);
    c.set('matcher', matcher);

    await next();
  };
};
