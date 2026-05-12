# Database

PostgreSQL 16 with PostGIS, accessed via RDS Proxy. Lambda connects through the proxy — never directly to the RDS instance.

## Schema

```sql
CREATE TABLE places (
  id       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name     TEXT          NOT NULL,
  category TEXT          NOT NULL,
  rating   NUMERIC(2,1),
  lat      NUMERIC(9,6)  NOT NULL,
  lon      NUMERIC(9,6)  NOT NULL,
  location GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (ST_MakePoint(lon, lat)::geography) STORED
);

CREATE INDEX places_location_idx ON places USING GIST (location);
```

- `location` is auto-computed from `lat`/`lon` — never set it manually on insert
- `category` is one of: `Comida`, `Farmacia`, `Gasolinera`, `Café`, `Tienda`, `Hospital`, `Banco`, `Gimnasio`, `Hotel`
- `rating` is nullable, range 0.0–9.9

## Credential Fetching

Fetch credentials from Secrets Manager **at cold start** (outside the handler), following the AWS-recommended pattern:

```js
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

let response;

try {
  response = await client.send(
    new GetSecretValueCommand({
      SecretId: process.env.DB_SECRET_ARN,
      VersionStage: "AWSCURRENT",
    }),
  );
} catch (error) {
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}

const { username, password } = JSON.parse(response.SecretString);
```

## Connection Pool

```js
import pg from "pg";

const pool = new pg.Pool({
  host: process.env.DB_PROXY_ENDPOINT,
  port: 5432,
  database: "placey",
  user: username,
  password: password,
  ssl: { rejectUnauthorized: false }, // RDS Proxy requires TLS
});
```

Initialize the pool at module level (cold start), not inside the handler.

## Proximity Query

PostGIS `ST_DWithin` + `ST_Distance` for radius search. Parameter order: `$1` = lon, `$2` = lat.

```sql
SELECT
  id,
  name,
  category,
  rating,
  lat,
  lon,
  ST_Distance(location, ST_MakePoint($1, $2)::geography) AS distance
FROM places
WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3)
  AND ($4::text IS NULL OR category = $4)
ORDER BY distance ASC;
```

Parameters: `$1` = lon, `$2` = lat, `$3` = radius (meters), `$4` = category (nullable).

## Inserting a Place

```sql
INSERT INTO places (name, category, rating, lat, lon)
VALUES ('Mariscos El Dorado', 'Comida', 5.0, 20.549433, -103.4701384);
```
