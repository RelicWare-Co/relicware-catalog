import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

function getRouteFamily(pathname: string) {
  if (pathname === "/login" || pathname === "/register") {
    return "auth";
  }

  if (pathname.startsWith("/dashboard")) {
    return "dashboard";
  }

  return "default";
}

export function ViewTransitionOrchestrator() {
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;

    const handlePointerDown = (event: PointerEvent) => {
      root.style.setProperty("--vt-origin-x", `${event.clientX}px`);
      root.style.setProperty("--vt-origin-y", `${event.clientY}px`);
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.routeFamily = getRouteFamily(
      location.pathname,
    );
  }, [location.pathname]);

  return null;
}
