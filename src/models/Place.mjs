/**
 * Shapes a raw database row into the Place response object.
 *
 * @param {object} row - Raw row from the database query
 * @returns {object} Formatted place object
 */
export function formatPlace(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    distance: row.distance !== undefined ? Math.round(row.distance) : undefined,
    rating: row.rating !== null ? parseFloat(row.rating) : null,
    location: {
      lat: parseFloat(row.lat),
      lon: parseFloat(row.lon),
    },
  };
}
