export function twimlResponse(xml: string) {
  return new Response(xml, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
}

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function say(text: string, language: string) {
  return `<Say language="${language}">${escapeXml(text)}</Say>`;
}

export function gatherAttributes({
  action,
  hints,
  language,
}: {
  action: string;
  hints: string[];
  language: string;
}) {
  return [
    'input="speech dtmf"',
    `language="${language}"`,
    'timeout="10"',
    'speechTimeout="auto"',
    'numDigits="1"',
    `hints="${escapeXml(hints.join(","))}"`,
    `action="${escapeXml(action)}"`,
    'method="POST"',
  ].join(" ");
}
