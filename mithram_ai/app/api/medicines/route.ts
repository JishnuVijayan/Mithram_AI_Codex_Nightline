import { createMedicine } from "@/app/lib/repositories";
import { validationError } from "@/app/lib/http";
import { medicineSchema } from "@/app/lib/validation";

export async function POST(request: Request) {
  try {
    const data = medicineSchema.parse(await request.json());
    const medicine = await createMedicine(data);

    return Response.json({ medicineId: medicine.id });
  } catch (error) {
    return validationError(error);
  }
}
