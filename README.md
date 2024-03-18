# SNEL (Simple Named Entity Linking)

A monorepo for named entity linking (NEL).

:warning: **This is a proof of concept**. Do not use in production. :warning:

## Notes about this app

1. The goal of the app is to find out whether it's possible to extract named entities from texts and to match these entities with terms from terminology sources. If so, it could assist the creators of the texts to semi-automatically assign terms to the metadata of their texts, improving their findability.
1. The app uses the Natural Language API of Google for named entity recognition. This allows us to get NER working quickly, without having to install our own NER software. However, you can replace this API with another, e.g. an API from another vendor or an API that you've created and that runs on top of your own NER tooling.
1. The results of the app must be improved! Notably:
    1. The app matches terms for _all_ named entities in a text. However, not every entity is important, resulting in a poor recall and precision. Improvement: only match terms for the most important entities, using some kind of measurement algorithm (e.g. tf-idf)
    1. The app matches individual terms and does not take the context of a text into consideration, e.g. the sentence in which a named entity appears. This leads to false positives: valid term matches from valid named entities that are not related to the text. Solution: only match terms that are related to the text.

## Before starting development on the app

1. Configure Node 20 on your development environment. Or use Docker (see underneath).
1. Activate Google's [Natural Language API](https://cloud.google.com/natural-language).
1. Rename `.env.dist` to `.env`
1. In `.env`: put the email address associated with your Google Natural Language account in `GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_EMAIL` and the corresponding private key in `GOOGLE_NATURAL_LANGUAGE_API_ACCOUNT_PRIVATE_KEY`.
1. In `.env`: set `SNEL_API_ENDPOINT_URL` to `http://host.docker.internal:3000` (when developing with Docker) or to `http://localhost:3000` (when developing without Docker)

## Development with Docker

### Install packages

    docker run --rm -it -v "$PWD":/app -w /app node:20 npm install --no-progress

### Run container

    docker run --rm -it -v "$PWD":/app -w /app --env-file .env node:20 /bin/bash

### Run server locally

    docker run --rm -it -v "$PWD":/app -w /app --env-file .env -p 3000:3000 node:20 npm run dev

Then go to http://localhost:3000/demo for the demonstrator or to http://localhost:3000/api for the API.
