// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import {
  SecretsManagerClient,
  GetSecretValueCommand
} from "@aws-sdk/client-secrets-manager";
import pg from "pg";

const secret_name = process.env.DB_SECRET_ARN;

const client = new SecretsManagerClient({
  region: "us-east-1"
});

let response;

try {
  response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT" // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
} catch (error) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}

const secret = response.SecretString;

// Your code goes here
const { username, password } = JSON.parse(secret);

export const pool = new pg.Pool({
  host: process.env.DB_PROXY_ENDPOINT, // RDS Proxy hostname
  port: 5432,
  database: "placey",
  user: username,
  password: password,
  ssl: { rejectUnauthorized: false } // RDS Proxy requires TLS
});
