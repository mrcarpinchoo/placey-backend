/**
 * Wraps a Lambda handler with top-level error handling.
 * Catches any unhandled errors and returns a 500 response.
 *
 * @param {Function} handler - The Lambda handler function to wrap
 * @returns {Function} Wrapped handler
 */
export function withErrorHandler(handler) {
  return async (event) => {
    try {
      return await handler(event);
    } catch (err) {
      console.error("Unhandled error:", err);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Internal server error" }),
      };
    }
  };
}
