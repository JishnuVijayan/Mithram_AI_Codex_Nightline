import { createParent } from "@/app/lib/repositories";
import { validationError } from "@/app/lib/http";
import { parentSchema } from "@/app/lib/validation";

export async function POST(request: Request) {
  try {
    const data = parentSchema.parse(await request.json());
    const parent = await createParent(data);

    return Response.json({ parentId: parent.id });
  } catch (error) {
    return validationError(error);
  }
}
