import type { QueryClient } from "@tanstack/react-query";
import {
  dehydrate,
  hydrate,
  useQueryClient,
  DehydratedState,
} from "@tanstack/react-query";
import { uneval } from "devalue";
import type { ReactNode } from "react";
import { useStream } from "react-streaming";

declare global {
  interface Window {
    _rqd_?: { push: (entry: DehydratedState) => void } | string[];
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
      `<script class="_rqd_">_rqd_=[];_rqc_=()=>{Array.from(
        document.getElementsByClassName("_rqd_")
      ).forEach((e) => e.remove())};_rqc_()</script>`
    );
    queryClient.getQueryCache().subscribe((event) => {
      if (
        ["added", "updated"].includes(event.type) &&
        event.query.state.status === "success"
      )
        stream.injectToStream(
          `<script class="_rqd_">_rqd_.push(${uneval(
            dehydrate(queryClient, {
              shouldDehydrateQuery: (query) =>
                query.queryHash === event.query.queryHash,
            })
          )});_rqc_()</script>`
        );
    });
  }

  if (!import.meta.env.SSR && Array.isArray(window._rqd_)) {
    const onEntry = (entry: DehydratedState) => {
      hydrate(queryClient, entry);
    };

    for (const entry of window._rqd_) {
      onEntry(entry);
    }

    window._rqd_ = { push: onEntry };
  }
  return props.children;
}
