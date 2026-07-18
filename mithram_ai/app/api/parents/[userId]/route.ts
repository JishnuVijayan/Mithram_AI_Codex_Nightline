import { getParentsWithLatestCall } from "@/app/lib/repositories";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/parents/[userId]">,
) {
  const { userId } = await context.params;
  const parents = await getParentsWithLatestCall(userId);

  return Response.json({
    parents: parents.map((parent) => ({
      ...parent,
      latestCall: parent.callLogs[0] ?? null,
      callLogs: undefined,
    })),
  });
}
