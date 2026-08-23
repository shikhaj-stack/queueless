"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Lang, LText } from "./types.ts";

/**
 * Active language, kept in localStorage (an external store, so no effects or
 * context needed). SSR always renders English; React swaps in the saved
 * language on hydration.
 */
const KEY = "ql_lang";

let lang: Lang | null = null;
const subs = new Set<() => void>();

function getLang(): Lang {
  if (lang) return lang;
  if (typeof window === "undefined") return "en";
  lang = localStorage.getItem(KEY) === "hi" ? "hi" : "en";
  return lang;
}

function subscribe(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function useLang() {
  const active = useSyncExternalStore(subscribe, getLang, () => "en" as Lang);

  const setLang = useCallback((l: Lang) => {
    lang = l;
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
    subs.forEach((fn) => fn());
  }, []);

  /** Resolve an LText in the active language, falling back to English. */
  const t = useCallback(
    (v: LText | undefined) => (v ? v[active] ?? v.en : ""),
    [active],
  );

  return { lang: active, setLang, t };
}

export function LangToggle() {
  const { lang: active, setLang } = useLang();
  return (
    <div className="flex overflow-hidden rounded-full border border-slate-300 text-xs font-medium">
      {(["en", "hi"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={active === l}
          className={`px-3 py-1 ${
            active === l ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
}
