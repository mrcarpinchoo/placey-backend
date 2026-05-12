import { withErrorHandler } from "../middleware/errorHandler.mjs";
import { parsePlaceParams } from "../controllers/getPlaceController.mjs";
import { getPlaceById } from "../services/placesService.mjs";

export const handler = withErrorHandler(async event => {
  let params;

  try {
    params = parsePlaceParams(event);
  } catch (err) {
    return {
      statusCode: err.statusCode ?? 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }

  const place = await getPlaceById(params.placeId);

  if (!place) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Place not found" })
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(place)
  };
});
