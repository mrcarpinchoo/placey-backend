# Backend Deployment Guide

Step-by-step guide to deploy the Placey backend. Assumes the infrastructure (VPC, RDS, RDS Proxy, Secrets Manager, Lambda functions, API Gateway) has already been provisioned following the AWS Console Guide.

## Prerequisites

- Node.js 24.x installed (`nvm install && nvm use`)
- AWS CLI configured with credentials that have Lambda update permissions
- Access to the AWS Console

## Step 1 - Run the Database Dump

The dump enables PostGIS, creates the `places` table, and loads seed data.

The dump is run from your local machine. Since the RDS instance is in a private subnet, you need to temporarily expose it first, then revert the changes once done.

### 1.1 - Open temporary access

Fetch your public IP and the security group ID:

```sh
MY_IP=$(curl -s https://checkip.amazonaws.com)

SG_ID=$(
  aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=placey-dev-sg-rds" \
    --query "SecurityGroups[0].GroupId" \
    --output text
)
```

Add an inbound rule for port 5432 from your IP:

```sh
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr "$MY_IP/32"
```

Create an Internet Gateway, attach it to the VPC, and add a route:

```sh
VPC_ID=$(
  aws ec2 describe-vpcs \
    --filters "Name=tag:Name,Values=placey-dev-vpc" \
    --query "Vpcs[0].VpcId" \
    --output text
)

IGW_ID=$(
  aws ec2 create-internet-gateway \
    --query "InternetGateway.InternetGatewayId" \
    --output text
)

aws ec2 attach-internet-gateway \
  --internet-gateway-id $IGW_ID \
  --vpc-id $VPC_ID

RT_ID=$(
  aws ec2 describe-route-tables \
    --filters "Name=tag:Name,Values=placey-dev-rt-data" \
    --query "RouteTables[0].RouteTableId" \
    --output text
)

aws ec2 create-route \
  --route-table-id $RT_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID
```

Enable public access on the RDS instance and wait for it to be ready:

```sh
aws rds modify-db-instance \
  --db-instance-identifier placey-dev-postgres-db01 \
  --publicly-accessible \
  --apply-immediately

aws rds wait db-instance-available \
  --db-instance-identifier placey-dev-postgres-db01
```

### 1.2 - Fetch credentials and endpoint

```sh
RDS_SECRET=$(
  aws rds describe-db-instances \
    --db-instance-identifier placey-dev-postgres-db01 \
    --query "DBInstances[0].MasterUserSecret.SecretArn" \
    --output text
)

SECRET_JSON=$(
  aws secretsmanager get-secret-value \
    --secret-id "$RDS_SECRET" \
    --query SecretString \
    --output text
)

DB_HOST=$(
  aws rds describe-db-instances \
    --db-instance-identifier placey-dev-postgres-db01 \
    --query "DBInstances[0].Endpoint.Address" \
    --output text
)

DB_USER=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['username'])")
DB_PASS=$(echo "$SECRET_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])")
```

### 1.3 - Run the dump

```sh
PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d placey -f db/dump.sql
```

### 1.4 - Verify

```sh
PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d placey \
  -c "SELECT COUNT(*) FROM places;"
```

### 1.5 - Revert temporary access

Remove the inbound rule from the security group:

```sh
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr "$MY_IP/32"
```

Disable public access:

```sh
aws rds modify-db-instance \
  --db-instance-identifier placey-dev-postgres-db01 \
  --no-publicly-accessible \
  --apply-immediately
```

Remove the route, detach and delete the Internet Gateway:

```sh
aws ec2 delete-route \
  --route-table-id $RT_ID \
  --destination-cidr-block 0.0.0.0/0

aws ec2 detach-internet-gateway \
  --internet-gateway-id $IGW_ID \
  --vpc-id $VPC_ID

aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID
```

## Step 2 - Build and Deploy the Lambda Functions

### 2.1 - Install dependencies

```sh
npm install
```

### 2.2 - Build, zip, and deploy

```sh
npm run ship
```

## Step 3 - Verify Lambda Environment Variables

Each Lambda function must have these environment variables set. Check them under **Lambda** > select function > **Configuration** > **Environment variables**.

| Variable            | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `DB_SECRET_ARN`     | ARN of the Secrets Manager secret with DB credentials |
| `DB_PROXY_ENDPOINT` | Hostname of the RDS Proxy                             |
| `NODE_ENV`          | `dev`                                                 |

To retrieve the values via CLI:

```sh
# Secret ARN
aws rds describe-db-instances \
  --db-instance-identifier placey-dev-postgres-db01 \
  --query "DBInstances[0].MasterUserSecret.SecretArn" \
  --output text

# Proxy endpoint
aws rds describe-db-proxies \
  --db-proxy-name placey-dev-rds-proxy \
  --query "DBProxies[0].Endpoint" \
  --output text
```

## Step 4 - Verify the Deployment

Get the API Gateway invoke URL:

```sh
API_URL=$(
  aws apigatewayv2 get-apis \
    --query "Items[?Name=='placey-dev-api'].ApiEndpoint" \
    --output text
)
```

Test the endpoints:

```sh
# Search places
curl "$API_URL/dev/places?lat=20.67&lon=-103.34&radius=5000"

# Filter by category
curl "$API_URL/dev/places?lat=20.67&lon=-103.34&radius=5000&category=Comida"

# Get a single place (replace with a real UUID from the search results)
curl "$API_URL/dev/places/<placeId>"
```

Expected responses:

- `200` with a JSON array for `/places`
- `200` with a JSON object for `/places/{placeId}`
- `400` for missing or invalid parameters
- `404` for an unknown `placeId`
