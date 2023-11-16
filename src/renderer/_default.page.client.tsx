import { PropsWithChildren } from "react";
import { createRoot, hydrateRoot, Root } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { PageShell } from "./PageShell.js";
import type { PageContextClient } from "./types.js";

export const clientRouting = true;
export const hydrationCanBeAborted = true;

let root: Root | null = null;

const queryClient = new QueryClient();

export const render = (pageContext: PageContextClient) => {
  const { Page, pageProps } = pageContext;
  const Layout =
    (pageContext.exports.Layout as React.FC<PropsWithChildren>) ||
    (({ children }) => children);
  const layoutProps = pageContext.exports.layoutProps || {};

  const page = (
    <PageShell pageContext={pageContext} queryClient={queryClient}>
      <Layout {...layoutProps}>
        <Page {...pageProps} />
      </Layout>
    </PageShell>
  );

  const container = document.getElementById("page-view")!;
  if (container.innerHTML === "" || !pageContext.isHydration) {
    if (!root) {
      root = createRoot(container);
    }
    root.render(page);
    // SSR
  } else {
    root = hydrateRoot(container, page);
  }
};
