import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

type LocationChangeInfo = {
  fromLocation?: {
    pathname: string;
  };
  toLocation: {
    pathname: string;
  };
  pathChanged: boolean;
  hrefChanged: boolean;
  hashChanged: boolean;
};

function getRouteFamily(pathname: string) {
  if (pathname === "/login" || pathname === "/register") {
    return "auth";
  }

  if (pathname.startsWith("/dashboard")) {
    return "dashboard";
  }

  return "default";
}

function getDashboardRouteRank(pathname: string) {
  if (pathname === "/dashboard") {
    return 0;
  }

  if (pathname.startsWith("/dashboard/catalogs")) {
    return 1;
  }

  if (pathname.startsWith("/dashboard/products")) {
    return 2;
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return 3;
  }

  return 99;
}

function getViewTransitionTypes({
  fromLocation,
  toLocation,
  pathChanged,
  hrefChanged,
}: LocationChangeInfo) {
  if (!hrefChanged || !pathChanged) {
    return false;
  }

  const fromPath = fromLocation?.pathname ?? "";
  const toPath = toLocation.pathname;
  const fromFamily = getRouteFamily(fromPath);
  const toFamily = getRouteFamily(toPath);

  if (fromFamily === "auth" && toFamily === "auth") {
    return ["auth-swap", "route-fade"];
  }

  if (fromFamily === "dashboard" && toFamily === "dashboard") {
    const direction =
      getDashboardRouteRank(toPath) >= getDashboardRouteRank(fromPath)
        ? "dashboard-forward"
        : "dashboard-back";

    return [direction, "route-fade"];
  }

  if (toFamily === "dashboard") {
    return ["enter-dashboard", "route-fade"];
  }

  if (toFamily === "auth") {
    return ["enter-auth", "route-fade"];
  }

  return ["route-fade"];
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    context: getContext(),
    defaultViewTransition: {
      types: getViewTransitionTypes,
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
