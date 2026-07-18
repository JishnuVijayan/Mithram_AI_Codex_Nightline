import { jsonError, serverError } from "@/app/lib/http";
import {
  GREETINGS,
  normalizeLanguage,
  QUESTIONS,
  SPEECH_HINTS,
  twilioSpeechLanguage,
} from "@/app/lib/questions";
import { getCallLogWithParent } from "@/app/lib/repositories";
import { gatherAttributes, say, twimlResponse } from "@/app/lib/twiml";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const logId = url.searchParams.get("logId");

    if (!logId) {
      return jsonError("Missing logId", 400);
    }

    const callLog = await getCallLogWithParent(logId);

    if (!callLog) {
      return jsonError("Call log not found", 404);
    }

    const language = normalizeLanguage(callLog.parent.preferredLanguage);
    const speechLanguage = twilioSpeechLanguage();
    const action = `/api/twiml/step?logId=${encodeURIComponent(logId)}&step=1`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${say(GREETINGS[language], speechLanguage)}
  <Gather ${gatherAttributes({ action, hints: SPEECH_HINTS, language: speechLanguage })}>
    ${say(QUESTIONS[language][0], speechLanguage)}
  </Gather>
  <Redirect method="POST">/api/twiml/connect?logId=${encodeURIComponent(logId)}</Redirect>
</Response>`;

    return twimlResponse(xml);
  } catch (error) {
    return serverError(error);
  }
}
