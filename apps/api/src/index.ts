import {app as api} from './api/app.js';
import {app as demo} from './demonstrator/app.js';
import {serve} from '@hono/node-server';
import {serveStatic} from '@hono/node-server/serve-static';
import {handle} from '@hono/node-server/vercel';
import {Hono} from 'hono';

const app = new Hono();

app.route('api', api);
app.route('demo', demo);

app.get('/', c => c.redirect('/demo'));

app.use('/assets/*', serveStatic({root: './public'}));

// For local development
if (process.env.NODE_ENV === 'development') {
  serve(app);
}

// For Vercel Serverless Function
export default handle(app);
