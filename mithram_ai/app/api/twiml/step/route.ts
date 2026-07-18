import { jsonError, serverError } from "@/app/lib/http";
import {
  GOODBYES,
  normalizeLanguage,
  QUESTIONS,
  twilioSpeechLanguage,
} from "@/app/lib/questions";
import {
  getCallLogWithParent,
  markCallAnswered,
  saveCallAnswer,
} from "@/app/lib/repositories";
import { say, twimlResponse } from "@/app/lib/twiml";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const logId = url.searchParams.get("logId");
    const step = Number(url.searchParams.get("step"));

    if (!logId || ![1, 2, 3].includes(step)) {
      return jsonError("Missing or invalid call step", 400);
    }

    const formData = await request.formData();
    const answer = String(formData.get("SpeechResult") || "(no response)");
    await saveCallAnswer(logId, step, answer);

    const callLog = await getCallLogWithParent(logId);

    if (!callLog) {
      return jsonError("Call log not found", 404);
    }

    const language = normalizeLanguage(callLog.parent.preferredLanguage);
    const speechLanguage = twilioSpeechLanguage();

    if (step < 3) {
      const nextStep = step + 1;
      const action = `/api/twiml/step?logId=${encodeURIComponent(logId)}&step=${nextStep}`;
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="${speechLanguage}" timeout="10" speechTimeout="auto" action="${action.replaceAll("&", "&amp;")}" method="POST">
    ${say(QUESTIONS[language][step], speechLanguage)}
  </Gather>
  <Redirect method="POST">/api/twiml/step?logId=${encodeURIComponent(logId)}&amp;step=${step}</Redirect>
</Response>`;

      return twimlResponse(xml);
    }

    await markCallAnswered(logId);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${say(GOODBYES[language], speechLanguage)}
  <Hangup/>
</Response>`;

    return twimlResponse(xml);
  } catch (error) {
    return serverError(error);
  }
}
