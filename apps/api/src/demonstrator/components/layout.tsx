import {html} from 'hono/html';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Layout(props: {title: string; children?: any}) {
  return (
    <>
      {html`<!doctype html>`}
      <html>
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="preconnect" href="https://fonts.bunny.net" />
          <link
            href="https://fonts.bunny.net/css?family=Inter:wght@400;500;700;800&display=swap"
            rel="stylesheet"
          />
          <link href="/assets/style.css" rel="stylesheet" />
          <script src="https://unpkg.com/htmx.org@1.9.10/dist/htmx.min.js"></script>
          <script src="https://unpkg.com/htmx.org@1.9.10/dist/ext/response-targets.js"></script>
          <script src="https://unpkg.com/clipboard@2/dist/clipboard.min.js"></script>
          <title>{props.title}</title>
        </head>
        <body class="bg-[#fafafa]">
          <header class="mx-auto max-w-screen-xl pt-10 px-5">
            <nav class="flex flex-row justify-center">
              <p class="rounded-full bg-brand-red text-white px-3 py-1 text-sm -rotate-3">
                Prototype
              </p>
            </nav>
            <h1 class="text-6xl font-bold pt-5 text-center tracking-tight">
              SNEL: Simple Named Entity Linking
            </h1>
            <p class="text-lg pt-5 text-center text-slate-600">
              SNEL haalt <em>named entities</em>, zoals namen van locaties of
              personen, uit een tekst en matcht deze met termen in termenlijsten
              via hun <em>reconciliation services</em>
            </p>
          </header>
          <main
            class="mx-auto max-w-screen-xl py-10 px-5"
            hx-ext="response-targets"
          >
            {props.children}
          </main>
          <footer class="border-t border-slate-200">
            <div class="py-5 px-5 lg:px-0 mx-auto max-w-screen-lg text-center">
              <p>
                SNEL is gemaakt door&nbsp;
                <a
                  href="https://sjorsdevalk.nl"
                  class="text-brand-red underline"
                >
                  Sjors de Valk
                </a>
                &nbsp;en&nbsp;
                <a
                  href="https://www.erfgoedbrabant.nl"
                  class="text-brand-red underline"
                >
                  Erfgoed Brabant
                </a>
                , in opdracht van het&nbsp;
                <a
                  href="https://netwerkdigitaalerfgoed.nl/"
                  class="text-brand-red underline"
                >
                  Netwerk Digitaal Erfgoed
                </a>
              </p>
            </div>
          </footer>
          {html`
            <script>
              htmx.onLoad(() => {
                new ClipboardJS('.copy');
              });
            </script>
          `}
        </body>
      </html>
    </>
  );
}
