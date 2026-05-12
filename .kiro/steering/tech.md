# Tech Stack

## Runtime

- **Node.js 24.x** on AWS Lambda
- **ES Modules** (`.mjs`) — use `import`/`export`, not `require`
- Handler export: `export const handler = async (event) => { ... }`

## Key Libraries

| Library                           | Purpose                                              |
| --------------------------------- | ---------------------------------------------------- |
| `pg`                              | PostgreSQL client (connection pooling via `pg.Pool`) |
| `@aws-sdk/client-secrets-manager` | Fetch DB credentials from Secrets Manager            |

## AWS Services

- **Lambda** — compute (one function per endpoint)
- **API Gateway HTTP API v2** — public entry point
- **RDS PostgreSQL 16 + PostGIS** — database
- **RDS Proxy** — connection pooling in front of RDS
- **Secrets Manager** — DB credentials storage
- **VPC** — Lambda runs in a private subnet with no internet access

## Environment Variables

| Variable            | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `DB_SECRET_ARN`     | ARN of the Secrets Manager secret with DB credentials |
| `DB_PROXY_ENDPOINT` | Hostname of the RDS Proxy                             |
| `NODE_ENV`          | `dev`                                                 |

## Node.js Version Management

Node.js version is pinned via `.nvmrc`. To install and activate:

```bash
nvm install
nvm use
```

## Common Commands

| Task        | Command                                                                       |
| ----------- | ----------------------------------------------------------------------------- |
| Install     | `npm install`                                                                 |
| Build       | `npm run build` — esbuild bundles each route into `dist/<function>/index.mjs` |
| Zip         | `npm run zip` — zips each bundle into `dist/<function>.zip`                   |
| Build + Zip | `npm run bundle`                                                              |
| Deploy      | `npm run deploy` — uploads both zips to Lambda via AWS CLI                    |
| Ship        | `npm run ship` — bundle + deploy in one command                               |
