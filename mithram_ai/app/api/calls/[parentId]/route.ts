import { getCallLogs } from "@/app/lib/repositories";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/calls/[parentId]">,
) {
  const { parentId } = await context.params;
  const calls = await getCallLogs(parentId);

  return Response.json({ calls });
}
