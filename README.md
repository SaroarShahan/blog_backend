# blog_backend

A small NestJS-based blog backend providing authentication, post and comment management. This repository contains the API server, configuration, and instructions to run the project locally.

## Tech stack

- Node.js (>= 22)
- NestJS
- TypeScript

## Features

- JWT authentication (register / login)
- CRUD for posts
- Comments on posts
- Clean modular structure using Nest modules, controllers and services

## Quick status

This README was generated/updated to provide setup and usage guidance. If something in the codebase differs (routes, env names), prefer the code as source of truth and open an issue or PR to update this file.

## Prerequisites

- Node.js 22+ and yarn
- A database mongodb

## Environment variables

Create a `.env` file in the project root or provide environment variables by your deployment system. Typical variables used by this project:

- PORT=8080
- MONGODB_URI=mongodb://user:pass@localhost:27017/blog_db
- JWT_SECRET=your_jwt_secret_here
- NODE_ENV=development

Adjust the names/values if your codebase uses different env variable names.

## Install

Install dependencies:

```bash
yarn or yarn install
```

## Development

Run the app in development mode with hot reload (Nest CLI/watch):

```bash
yarn start:dev
```

By default the server listens on the port from `PORT` or 8080.

## Build

Build the TypeScript to JavaScript:

```bash
yarn build
```

## Run (production)

Start the built app:

```bash
yarn start:prod
```

## Lint & Tests

Lint:

```bash
yarn lint
```

Run tests (if present):

```bash
yarn test
```

## API (example endpoints)

The exact routes and payloads depend on the controllers implemented. Below are common, reasonable endpoints for a blog backend — adapt them to match your code.

- POST /auth/register - register a user
- POST /auth/login - login and receive a JWT
- POST /auth/logout
- GET /posts - list public posts
- GET /posts/:id - get a single post
- POST /posts - create a post (authenticated)
- PATCH /posts/:id - update a post (authenticated & authorized)
- DELETE /posts/:id - delete a post (authenticated & authorized)
- GET /posts/:id/comments - list comments for a post
- POST /posts/:id/comments - add a comment (authenticated)

```

## Project structure

Typical layout (your repo may vary):

```

src/
app.module.ts # root module
main.ts # bootstrap
auth/ # auth module (controllers, services, strategies)
users/ # user module
posts/ # posts module (controllers/services/entities)
comments/ # comments module

```

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a pull request with a clear description

Please follow existing code style and add tests for new behavior.

## Troubleshooting

- If you see runtime errors about missing env vars, verify `.env` is present and variables are exported.
- If TypeScript compile errors occur, run `npm run build` to see the full diagnostics.

## License

MIT
```
