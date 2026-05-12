/**
 * Parses and validates path parameters for the get-place endpoint.
 *
 * @param {object} event - API Gateway HTTP API v2 event
 * @returns {{ placeId: string }}
 * @throws {Error} with a `statusCode` property if validation fails
 */
export function parsePlaceParams(event) {
  const placeId = event.pathParameters?.placeId;

  if (!placeId) {
    const err = new Error("Missing path parameter: placeId");
    err.statusCode = 400;
    throw err;
  }

  return { placeId };
}
