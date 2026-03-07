import { createFileRoute, redirect } from "@tanstack/react-router";

import { getServerSession } from "#/lib/session";
import { DashboardLayout } from "../layouts/DashboardLayout";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ location }) => {
    const session = await getServerSession();

    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { session };
  },
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <DashboardLayout /> // Outlet is already inside the DashboardLayout
  );
}
