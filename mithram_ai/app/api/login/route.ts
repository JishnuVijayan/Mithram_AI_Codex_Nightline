import { findUserByEmail } from "@/app/lib/repositories";
import { jsonError, validationError } from "@/app/lib/http";
import { loginSchema } from "@/app/lib/validation";

export async function POST(request: Request) {
  try {
    const data = loginSchema.parse(await request.json());
    const user = await findUserByEmail(data.email);

    if (!user || user.password !== data.password) {
      return jsonError("Invalid email or password", 401);
    }

    return Response.json({ userId: user.id });
  } catch (error) {
    return validationError(error);
  }
}
