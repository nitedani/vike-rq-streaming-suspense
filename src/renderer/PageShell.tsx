import { PageContextProvider } from "#root/src/hooks/usePageContext.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ReactQueryStreamedHydration } from "./ReactQueryStreamedHydration.js";
import type { PageContext } from "./types.js";

export function PageShell({
  children,
  pageContext,
  queryClient,
}: {
  children: React.ReactNode;
  pageContext: PageContext;
  queryClient: QueryClient;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
        </QueryClientProvider>
      </PageContextProvider>
    </React.StrictMode>
  );
}
