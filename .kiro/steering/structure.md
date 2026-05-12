# Project Structure

## Layout

```
placey-backend/
├── src/
│   ├── controllers/  # Request parsing, response shaping
│   ├── lib/          # Shared utilities — DB connection, secret fetching, etc.
│   ├── middleware/   # Shared handler wrappers (error handling, validation)
│   ├── models/       # Data models (Place, Category)
│   ├── routes/       # Lambda entry points (search-places.mjs, get-place.mjs)
│   └── services/     # Business logic (proximity search, filtering)
├── dist/             # Build output — gitignored
│   ├── search-places/
│   │   └── index.mjs
│   └── get-place/
│       └── index.mjs
├── .kiro/
│   └── steering/
├── .nvmrc            # Node.js version pin (nvm)
├── package.json
├── .gitignore
└── README.md
```

## Key Conventions

- **One Lambda function per endpoint** — `search-places` and `get-place` are separate deployable units
- **Deployment artifact**: each function is a zip file with its entry file at the root (no subdirectories inside the zip)
- **ES Modules throughout** — all source files use `.mjs` extension and `import`/`export`
- **No shared runtime code between repos** — this repo is self-contained; cross-repo communication is REST only
- Route files in `src/routes/` are the Lambda handler entry points
- DB connection and credential fetching live in `src/lib/` and are initialized at cold start (outside the handler)
- esbuild bundles each route into a single `index.mjs` — module-level code runs at cold start as expected
- No `tests/` directory — testing is out of scope for this project
