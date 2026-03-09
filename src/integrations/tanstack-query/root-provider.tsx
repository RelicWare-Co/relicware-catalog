import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

let browserContext:
  | {
      queryClient: QueryClient;
    }
  | undefined;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status =
            typeof error === "object" &&
            error !== null &&
            "status" in error &&
            typeof error.status === "number"
              ? error.status
              : null;

          if (status !== null && status < 500) {
            return false;
          }

          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function getContext() {
  if (typeof document === "undefined") {
    return {
      queryClient: createQueryClient(),
    };
  }

  if (browserContext) {
    return browserContext;
  }

  browserContext = {
    queryClient: createQueryClient(),
  };

  return browserContext;
}

export default function TanStackQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { queryClient } = getContext();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
