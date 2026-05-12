import { withErrorHandler } from "../middleware/errorHandler.mjs";
import { parseSearchParams } from "../controllers/searchPlacesController.mjs";
import { searchPlaces } from "../services/placesService.mjs";

export const handler = withErrorHandler(async (event) => {
  let params;

  try {
    params = parseSearchParams(event);
  } catch (err) {
    return {
      statusCode: err.statusCode ?? 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }

  const places = await searchPlaces(params);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(places),
  };
});
