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
