# placey-backend

Backend for Placey — a proximity-based app that helps users discover nearby recreational places. Users provide coordinates and get back places sorted by distance, optionally filtered by category and radius.

This is an educational MVP built for a System Design course and portfolio.

## Architecture

Placey is split across three repos:

| Repo              | Responsibility                                 |
| ----------------- | ---------------------------------------------- |
| `placey-backend`  | Lambda functions, REST API, geospatial queries |
| `placey-frontend` | React app, map UI, search interface            |
| `placey-infra`    | Terraform IaC, all AWS resource provisioning   |

## Tech Stack

- **Runtime:** Node.js 24.x on AWS Lambda
- **Database:** PostgreSQL 16 + PostGIS on RDS, accessed via RDS Proxy
- **API:** API Gateway HTTP API v2
- **Credentials:** AWS Secrets Manager
- **Bundler:** esbuild

## Project Structure

```
placey-backend/
├── src/
│   ├── controllers/  # Request parsing and validation
│   ├── lib/          # Shared utilities (DB connection, secret fetching)
│   ├── middleware/   # Handler wrappers (error handling)
│   ├── models/       # Data models (Place, Category)
│   ├── routes/       # Lambda entry points
│   └── services/     # Business logic (proximity search)
├── scripts/          # Build, zip, and deploy scripts
├── db/               # Database dump and seed data
├── docs/             # API, database, and deployment reference
└── dist/             # Build output (gitignored)
```

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials

### Install nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Then restart your terminal, or run:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Install Node.js

```bash
nvm install
nvm use
```

## Setup

```bash
npm install
```

## Commands

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `npm run build`  | Bundle each Lambda function with esbuild |
| `npm run zip`    | Zip each bundle for Lambda deployment    |
| `npm run bundle` | Build + zip                              |
| `npm run deploy` | Upload both zips to Lambda via AWS CLI   |
| `npm run ship`   | Bundle + deploy in one command           |

### Manual deploy with AWS CLI

```bash
aws lambda update-function-code \
  --function-name placey-dev-search-places \
  --zip-file fileb://dist/search-places.zip

aws lambda update-function-code \
  --function-name placey-dev-get-place \
  --zip-file fileb://dist/get-place.zip
```

## Environment Variables

Each Lambda function requires the following environment variables, set via the AWS Console or infrastructure provisioning:

| Variable            | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `DB_SECRET_ARN`     | ARN of the Secrets Manager secret with DB credentials |
| `DB_PROXY_ENDPOINT` | Hostname of the RDS Proxy                             |
| `NODE_ENV`          | `dev`                                                 |

## Deployment

See [`docs/deploy.md`](docs/deploy.md) for the full step-by-step deployment guide.

## API

See [`docs/api.md`](docs/api.md) for endpoint definitions, request/response shapes, and error handling.

## Database

See [`docs/database.md`](docs/database.md) for schema, PostGIS usage, and connection details.
