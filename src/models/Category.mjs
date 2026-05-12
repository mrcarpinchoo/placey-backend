/**
 * Valid place categories.
 * Categories are stored as plain text in the places table.
 */
export const CATEGORIES = Object.freeze([
  "Comida",
  "Farmacia",
  "Gasolinera",
  "Café",
  "Tienda",
  "Hospital",
  "Banco",
  "Gimnasio",
  "Hotel"
]);

/**
 * Returns true if the given value is a valid category.
 *
 * @param {string} category
 * @returns {boolean}
 */
export function isValidCategory(category) {
  return CATEGORIES.includes(category);
}
