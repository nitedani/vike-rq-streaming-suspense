import type { QueryClient } from "@tanstack/react-query";
import { dehydrate, hydrate, useQueryClient } from "@tanstack/react-query";
import { uneval } from "devalue";
import type { ReactNode } from "react";
import { useStream } from "react-streaming";

declare global {
  interface Window {
    _rqd_?: string[];
    _rqc_?: () => void;
  }
}

/**
 * This component is responsible for:
 * - hydrating the query client on the client
 * - dehydrating the query client on the server
 */
export function ReactQueryStreamedHydration(props: {
  children: ReactNode;
  queryClient?: QueryClient;
}) {
  const stream = useStream();
  const queryClient = useQueryClient(props.queryClient);

  const preambleId = "_rqc_";
  const dataClassName = "_rqd_";

  if (stream) {
    stream.injectToStream(
      `<script id="${preambleId}">window._rqd_=[];window._rqc_=()=>{Array.from(
        window.document.getElementsByClassName("${dataClassName}")
      ).forEach((e) => e.remove())}</script>`
    );
    queryClient.getQueryCache().subscribe((event) => {
      switch (event.type) {
        case "added":
        case "updated": {
          if (event.query.state.status !== "success") {
            return;
          }
          stream.injectToStream(
            `<script class="${dataClassName}">window._rqd_.push(${uneval(
              dehydrate(queryClient, {
                shouldDehydrateQuery: (query) =>
                  query.queryHash === event.query.queryHash,
              })
            )});window._rqc_()</script>`
          );
        }
      }
    });
  }

  if (!stream && window._rqd_) {
    document.getElementById(preambleId)?.remove();
    for (const entry of window._rqd_) {
      hydrate(queryClient, entry);
    }
    delete window._rqd_;
    delete window._rqc_;
  }
  return props.children;
}
