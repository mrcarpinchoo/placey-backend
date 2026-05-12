# API Reference

API Gateway uses **HTTP API payload format version 2.0**.

## Endpoints

| Method | Route               | Lambda Function            | Description      |
| ------ | ------------------- | -------------------------- | ---------------- |
| GET    | `/places`           | `placey-dev-search-places` | Proximity search |
| GET    | `/places/{placeId}` | `placey-dev-get-place`     | Place details    |

---

### GET /places

Query parameters:

| Parameter  | Type   | Required | Description             |
| ---------- | ------ | -------- | ----------------------- |
| `lat`      | float  | Yes      | Latitude of the user    |
| `lon`      | float  | Yes      | Longitude of the user   |
| `radius`   | int    | Yes      | Search radius in meters |
| `category` | string | No       | Filter by category slug |

Example: `GET /places?lat=20.67&lon=-103.34&radius=2000&category=Comida`

Response `200 OK`:

```json
[
  {
    "id": "uuid",
    "name": "Mariscos El Dorado",
    "category": "Comida",
    "distance": 450,
    "rating": 5.0,
    "location": { "lat": 20.549433, "lon": -103.4701384 }
  }
]
```

---

### GET /places/{placeId}

Path parameter: `placeId` (UUID)

Response `200 OK`:

```json
{
  "id": "uuid",
  "name": "Mariscos El Dorado",
  "category": "Comida",
  "distance": 450,
  "rating": 5.0,
  "location": { "lat": 20.549433, "lon": -103.4701384 }
}
```

---

## Reading the API Gateway Event

```js
event.queryStringParameters; // { lat: "20.67", lon: "-103.34", radius: "2000" }
event.pathParameters; // { placeId: "uuid" }
event.requestContext.http.method;
event.requestContext.http.path;
```

Note: all query string values arrive as strings — parse numbers explicitly.

## Response Format

All responses must follow this shape:

```js
return {
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
};
```

## Error Handling

Return appropriate HTTP status codes with a JSON body:

```js
// 400 Bad Request
{ statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing required parameter: lat" }) }

// 404 Not Found
{ statusCode: 404, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Place not found" }) }

// 500 Internal Server Error
{ statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Internal server error" }) }
```
