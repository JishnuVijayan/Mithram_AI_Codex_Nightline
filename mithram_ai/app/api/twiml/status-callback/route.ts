import { jsonError, serverError } from "@/app/lib/http";
import { updateCallStatusIfInProgress } from "@/app/lib/repositories";

const answeredStatuses = new Set(["completed"]);

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const logId = url.searchParams.get("logId");

    if (!logId) {
      return jsonError("Missing logId", 400);
    }

    const formData = await request.formData();
    const callStatus = String(formData.get("CallStatus") || "");
    const nextStatus = answeredStatuses.has(callStatus) ? "answered" : "no_answer";

    await updateCallStatusIfInProgress(logId, nextStatus);

    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
