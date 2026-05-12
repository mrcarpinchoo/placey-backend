import { pool } from "../lib/db.mjs";
import { formatPlace } from "../models/Place.mjs";

/**
 * Searches for places within a given radius of the provided coordinates.
 *
 * @param {number} lat - Latitude of the user
 * @param {number} lon - Longitude of the user
 * @param {number} radius - Search radius in meters
 * @param {string|null} category - Optional category filter
 * @returns {Promise<object[]>} Array of formatted place objects sorted by distance
 */
export async function searchPlaces({ lat, lon, radius, category }) {
  const { rows } = await pool.query(
    `SELECT
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
    ORDER BY distance ASC`,
    [lon, lat, radius, category],
  );

  return rows.map(formatPlace);
}

/**
 * Retrieves a single place by its UUID.
 *
 * @param {string} placeId - UUID of the place
 * @returns {Promise<object|null>} Formatted place object, or null if not found
 */
export async function getPlaceById(placeId) {
  const { rows } = await pool.query(
    `SELECT id, name, category, rating, lat, lon
    FROM places
    WHERE id = $1`,
    [placeId],
  );

  if (rows.length === 0) return null;

  return formatPlace(rows[0]);
}
