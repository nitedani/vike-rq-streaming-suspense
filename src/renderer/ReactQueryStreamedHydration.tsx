"use client";
import { parse } from "@brillout/json-serializer/parse";
import { stringify } from "@brillout/json-serializer/stringify";
import type { DehydratedState, QueryClient } from "@tanstack/react-query";
import { dehydrate, hydrate, useQueryClient } from "@tanstack/react-query";
import { useRef, type ReactNode } from "react";
import { useStream } from "react-streaming";

const className = "rq-ssr-data";
const triggerClassName = "rq-entry-received";

declare global {
  interface Window {
    _rq_entry_received_: () => void;
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
  const queryClient = useQueryClient(props.queryClient) as QueryClient & {
    __ssr_entries: Set<string>;
  };

  // <server only>
  if (stream) {
    queryClient.getQueryCache().subscribe((event) => {
      switch (event.type) {
        case "added":
        case "updated": {
          const data = event.query.state.data;
          if (data === undefined) {
            return;
          }
          // avoid sending the same key multiple times
          const key = event.query.queryHash;
          queryClient.__ssr_entries ??= new Set<string>();
          if (!queryClient.__ssr_entries.has(key)) {
            queryClient.__ssr_entries.add(key);
            const htmlChunk = `
<script class="${className}" type="application/json">
    ${stringify(
      dehydrate(queryClient, {
        shouldDehydrateQuery(query) {
          return query.queryHash === event.query.queryHash;
        },
      }),
    )}
</script>
<script class="rq-chunk-received">
    if (window._rq_entry_received_) window._rq_entry_received_()
</script>`;
            stream.injectToStream(htmlChunk);
          }
        }
      }
    });
  }
  // </server only>

  const initialized = useRef(false);
  if (!stream && typeof window !== "undefined") {
    window._rq_entry_received_ = () => {
      const triggerEls = Array.from(
        window.document.querySelectorAll(`.${triggerClassName}`),
      );
      for (const el of triggerEls) {
        el.remove();
      }

      const els = Array.from(window.document.querySelectorAll(`.${className}`));
      for (const el of els) {
        const textContent = el.textContent;
        el.remove();
        if (!textContent) {
          throw new Error("No text content");
        }
        const dehydratedState = parse(textContent) as DehydratedState;
        hydrate(queryClient, dehydratedState);
      }
    };
    if (!initialized.current) {
      initialized.current = true;
      window._rq_entry_received_();
    }
  }
  return props.children;
}
