import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../layouts/DashboardLayout";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <DashboardLayout /> // Outlet is already inside the DashboardLayout
  );
}
