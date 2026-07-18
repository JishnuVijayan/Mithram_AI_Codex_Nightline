import { getDashboardStats } from "@/app/lib/repositories";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/dashboard/[userId]">,
) {
  const { userId } = await context.params;
  const stats = await getDashboardStats(userId);

  return Response.json({ stats });
}
