import { isValidCategory } from "../models/Category.mjs";

/**
 * Parses and validates query parameters for the search-places endpoint.
 *
 * @param {object} event - API Gateway HTTP API v2 event
 * @returns {{ lat: number, lon: number, radius: number, category: string|null }}
 * @throws {Error} with a `statusCode` property if validation fails
 */
export function parseSearchParams(event) {
  const params = event.queryStringParameters ?? {};

  const { lat, lon, radius, category } = params;

  if (lat === undefined || lon === undefined || radius === undefined) {
    const missing = ["lat", "lon", "radius"].filter(
      (k) => params[k] === undefined,
    );
    const err = new Error(
      `Missing required parameter(s): ${missing.join(", ")}`,
    );
    err.statusCode = 400;
    throw err;
  }

  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  const parsedRadius = parseInt(radius, 10);

  if (isNaN(parsedLat) || isNaN(parsedLon) || isNaN(parsedRadius)) {
    const err = new Error(
      "lat, lon must be valid numbers and radius must be a valid integer",
    );
    err.statusCode = 400;
    throw err;
  }

  if (category !== undefined && !isValidCategory(category)) {
    const err = new Error(`Invalid category: "${category}"`);
    err.statusCode = 400;
    throw err;
  }

  return {
    lat: parsedLat,
    lon: parsedLon,
    radius: parsedRadius,
    category: category ?? null,
  };
}
