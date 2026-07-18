import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function validationError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid request", 400);
  }

  return jsonError("Invalid request", 400);
}
