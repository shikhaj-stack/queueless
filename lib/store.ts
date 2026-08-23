"use client";

import { useSyncExternalStore } from "react";
import { SERVICES } from "./mock/services.ts";
import type {
  Application,
  Flag,
  Queue,
  Service,
  Token,
  VerificationReport,
} from "./types.ts";

/**
 * Demo persistence layer. Everything the mock API mutates lives here, in
 * localStorage so a page reload mid-demo doesn't lose the queue. When the real
 * backend lands, only lib/api.ts changes — components never touch this file
 * except through useDB().
 */
export type DB = {
  user: { id: string; name: string } | null;
  applications: Application[];
  queues: Queue[];
  tokens: Token[];
  /** Tokens created from this browser, so the citizen screen knows which is "mine". */
  my_token_ids: string[];
  saved: string[];
  /** slug -> requirement names the citizen has ticked off. */
  checked: Record<string, string[]>;
  reports: VerificationReport[];
  flags: Flag[];
  /** slug -> compiled draft spec, produced by the mock compiler. */
  drafts: Record<string, Service>;
  published: string[];
};

const KEY = "ql_demo_db_v1";

function seed(): DB {
  const now = Date.now();
  const queues: Queue[] = [
    {
      id: "q-tehsil-huzur-revenue",
      service_slug: "domicile-certificate",
      location_id: "loc-tehsil-huzur",
      open: true,
      next_number: 5,
      baseline_service_minutes: 6,
    },
    {
      id: "q-bmc-zone1",
      service_slug: "birth-certificate",
      location_id: "loc-bmc-zone1",
      open: true,
      next_number: 2,
      baseline_service_minutes: 4,
    },
  ];
  // A few tokens already in line, so the demo never opens on an empty screen.
  const tokens: Token[] = [
    {
      id: "t-seed-1",
      queue_id: "q-tehsil-huzur-revenue",
      number: 1,
      holder: "Ramesh K.",
      status: "done",
      joined_at: new Date(now - 40 * 60000).toISOString(),
      called_at: new Date(now - 34 * 60000).toISOString(),
      closed_at: new Date(now - 27 * 60000).toISOString(),
    },
    {
      id: "t-seed-2",
      queue_id: "q-tehsil-huzur-revenue",
      number: 2,
      holder: "Sunita B.",
      status: "serving",
      joined_at: new Date(now - 30 * 60000).toISOString(),
      called_at: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: "t-seed-3",
      queue_id: "q-tehsil-huzur-revenue",
      number: 3,
      holder: "Imran S.",
      status: "waiting",
      joined_at: new Date(now - 18 * 60000).toISOString(),
    },
    {
      id: "t-seed-4",
      queue_id: "q-tehsil-huzur-revenue",
      number: 4,
      holder: "Priya J.",
      status: "waiting",
      joined_at: new Date(now - 9 * 60000).toISOString(),
    },
    {
      id: "t-seed-5",
      queue_id: "q-bmc-zone1",
      number: 1,
      holder: "Anil T.",
      status: "waiting",
      joined_at: new Date(now - 12 * 60000).toISOString(),
    },
  ];
  return {
    user: null,
    applications: [],
    queues,
    tokens,
    my_token_ids: [],
    saved: [],
    checked: {},
    reports: [],
    flags: [],
    drafts: {},
    published: SERVICES.filter((s) => s.published).map((s) => s.slug),
  };
}

let db: DB | null = null;
let version = 0;
const subs = new Set<() => void>();

function notify() {
  version += 1;
  subs.forEach((fn) => fn());
}

export function read(): DB {
  if (db) return db;
  if (typeof window === "undefined") return (db = seed());
  try {
    const raw = localStorage.getItem(KEY);
    db = raw ? { ...seed(), ...(JSON.parse(raw) as DB) } : seed();
  } catch {
    db = seed();
  }
  return db;
}

/** Mutate the demo DB, persist, and wake every subscribed screen. */
export function write(mut: (d: DB) => void) {
  const d = read();
  mut(d);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(d));
  }
  notify();
}

export function resetAll() {
  db = seed();
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
  notify();
}

function subscribe(fn: () => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

if (typeof window !== "undefined") {
  // Cross-tab sync: staff dashboard in one tab, citizen queue in another.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      db = null;
      notify();
    }
  });
}

/** Bumps on every write, in this tab or another. Drives re-reads. */
export function useVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
}

/** Live read of the demo DB. Re-renders on any write, in this tab or another. */
export function useDB(): DB {
  useVersion();
  return read();
}

let counter = 0;
export const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;
