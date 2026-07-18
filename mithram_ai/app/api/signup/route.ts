import { createUser } from "@/app/lib/repositories";
import { jsonError, validationError } from "@/app/lib/http";
import { signupSchema } from "@/app/lib/validation";

export async function POST(request: Request) {
  try {
    const data = signupSchema.parse(await request.json());
    const user = await createUser(data);

    return Response.json({ userId: user.id });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return jsonError("Email is already registered", 409);
    }

    return validationError(error);
  }
}
