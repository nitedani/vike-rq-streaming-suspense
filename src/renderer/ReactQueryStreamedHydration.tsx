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
 * - dehydrating the query client on the server
 * - hydrating the query client on the client
 */
export function ReactQueryStreamedHydration(props: {
  children: ReactNode;
  queryClient?: QueryClient;
}) {
  const stream = useStream();
  const queryClient = useQueryClient(props.queryClient);

  if (import.meta.env.SSR && stream) {
    stream.injectToStream(
      `<script class="_rqc_">window._rqd_=[];window._rqc_=(c)=>{Array.from(
        window.document.getElementsByClassName(c)
      ).forEach((e) => e.remove())};window._rqc_("_rqc_")</script>`
    );
    queryClient.getQueryCache().subscribe((event) => {
      if (
        ["added", "updated"].includes(event.type) &&
        event.query.state.status === "success"
      )
        stream.injectToStream(
          `<script class="_rqd_">window._rqd_.push(${uneval(
            dehydrate(queryClient, {
              shouldDehydrateQuery: (query) =>
                query.queryHash === event.query.queryHash,
            })
          )});window._rqc_("_rqd_")</script>`
        );
    });
  }

  if (!import.meta.env.SSR && window._rqd_) {
    for (const entry of window._rqd_) {
      hydrate(queryClient, entry);
    }
    delete window._rqd_;
    delete window._rqc_;
  }
  return props.children;
}
