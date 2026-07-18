import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function validationError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid request", 400);
  }

  return serverError(error);
}

export function serverError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Can't reach database server")) {
      return jsonError(
        "Database is not reachable. Start the local database and try again.",
        500,
      );
    }

    if (process.env.NODE_ENV !== "production") {
      return jsonError(error.message, 500);
    }
  }

  return jsonError("Internal server error", 500);
}
