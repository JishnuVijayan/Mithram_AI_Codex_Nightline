import twilio from "twilio";
import { getTwilioEnv } from "@/app/lib/env";
import { jsonError, validationError } from "@/app/lib/http";
import {
  createInProgressCallLog,
  getParentById,
  saveCallSid,
} from "@/app/lib/repositories";
import { startCallSchema } from "@/app/lib/validation";

export async function POST(request: Request) {
  try {
    const { parentId } = startCallSchema.parse(await request.json());
    const parent = await getParentById(parentId);

    if (!parent) {
      return jsonError("Parent not found", 404);
    }

    const env = getTwilioEnv();
    const callLog = await createInProgressCallLog(parentId);
    const client = twilio(env.accountSid, env.authToken);
    const call = await client.calls.create({
      to: env.verifiedNumber,
      from: env.fromNumber,
      url: `${env.publicUrl}/api/twiml/connect?logId=${callLog.id}`,
      statusCallback: `${env.publicUrl}/api/twiml/status-callback?logId=${callLog.id}`,
      statusCallbackMethod: "POST",
      statusCallbackEvent: ["completed"],
    });

    await saveCallSid(callLog.id, call.sid);

    return Response.json({ callSid: call.sid, logId: callLog.id });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Missing environment")) {
      return jsonError(error.message, 500);
    }

    return validationError(error);
  }
}
