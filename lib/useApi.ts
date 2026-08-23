"use client";

import { useEffect, useState } from "react";
import { useVersion } from "./store";

/**
 * Calls a lib/api.ts function and re-runs it whenever the demo DB changes —
 * which is what stands in for Supabase Realtime today. Once the backend is
 * live, api functions become fetch() calls and this hook still works; swap
 * `useVersion()` for a realtime subscription or a poll interval.
 */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const version = useVersion();
  const [data, setData] = useState<T>();
  const key = JSON.stringify(deps);

  useEffect(() => {
    let live = true;
    fn().then((r) => live && setData(r));
    return () => {
      live = false;
    };
    // fn is recreated every render, so key+version are the real dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  return data;
}
