# API

## Endpoints

1. `POST /api/extract`: extract named entities from a text
1. `POST /api/match`: extract named entities from a text, match with terms from terminology services

See [./test](./test/) for more information, e.g. about the request and response. You can [use Bruno](https://www.usebruno.com/) for testing.

## To do, for future improvement

1. Add localization to the demonstrator. Currently it's Dutch-only
1. Make the API independent of the hosting platform that you'd like to deploy it to. Currently it can be run locally (Node.js) and on Vercel
