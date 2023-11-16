import { PropsWithChildren } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { renderToStream } from "react-streaming/server";
import { escapeInject } from "vike/server";
import { PageShell } from "./PageShell.js";
import type { PageContextServer } from "./types.js";

const SSR_ENABLED = true;

export const passToClient = ["pageProps"];

export async function render(pageContext: PageContextServer) {
  const {
    exports: { documentProps },
  } = pageContext;
  const title = documentProps?.title ?? "App";
  let stream;

  if (SSR_ENABLED) {
    const { Page, pageProps } = pageContext;
    const Layout =
      (pageContext.exports.Layout as React.FC<PropsWithChildren>) ||
      (({ children }) => children);
    const layoutProps = pageContext.exports.layoutProps || {};

    const queryClient = new QueryClient();
    stream = await renderToStream(
      <PageShell pageContext={pageContext} queryClient={queryClient}>
        <Layout {...layoutProps}>
          <Page {...pageProps} />
        </Layout>
      </PageShell>,
      {
        disable: false,
        webStream: false,
        renderToPipeableStream,
      },
    );
  } else {
    stream = "";
  }
  return {
    documentHtml: escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta name="color-scheme" content="dark light" />
        <meta name="description" content="App" />
        <meta charset="UTF-8" />
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="height: 100vh; overflow: hidden;">
        <div id="page-view" style="height: 100%; overflow: hidden;">${stream}</div>
      </body>
    </html>`,
    pageContext: {},
  };
}
