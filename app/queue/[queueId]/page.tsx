"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Btn, Card, Empty, Page, SectionTitle } from "@/components/ui";
import { getLocations, getQueue, getService, joinQueue, skipToken } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { useDB } from "@/lib/store";
import { S } from "@/lib/strings";
import { useApi } from "@/lib/useApi";

/** Ticks so elapsed/estimated minutes stay honest without a page refresh. */
function useTick(ms = 15000) {
  const [, set] = useState(0);
  useEffect(() => {
    const h = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(h);
  }, [ms]);
}

export default function QueuePage() {
  const { queueId } = useParams<{ queueId: string }>();
  const { t } = useLang();
  const db = useDB();
  useTick();

  const view = useApi(() => getQueue(queueId), [queueId]);
  const service = useApi(
    () => (view ? getService(view.queue.service_slug) : Promise.resolve(null)),
    [view?.queue.service_slug],
  );
  const locations = useApi(() => getLocations(), []) ?? [];
  const [name, setName] = useState("");

  if (view === undefined) return <Page back="/" />;
  if (!view)
    return (
      <Page back="/">
        <Empty />
      </Page>
    );

  const { queue, tokens, now_serving, waiting, avg_service_minutes } = view;
  const location = locations.find((l) => l.id === queue.location_id);
  const mine =
    tokens.find(
      (tk) =>
        db.my_token_ids.includes(tk.id) &&
        (tk.status === "waiting" || tk.status === "serving"),
    ) ??
    tokens.find((tk) => db.my_token_ids.includes(tk.id)) ??
    null;

  const ahead = mine
    ? tokens.filter((tk) => tk.status === "waiting" && tk.number < mine.number).length
    : waiting;
  const eta = ahead * avg_service_minutes;

  return (
    <Page back={service ? `/services/${service.slug}` : "/"} backLabel={S.backToService}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t(S.queue)}</h1>
          <p className="text-slate-500">
            {t(service?.name)}
            {location ? ` • ${t(location.name)}` : ""}
          </p>
        </div>
        {!queue.open && <Badge tone="red">{t(S.queueClosed)}</Badge>}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t(S.nowServing)}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {now_serving ? `#${now_serving.number}` : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t(S.waiting)}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{waiting}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t(S.avgService)}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {avg_service_minutes} <span className="text-base font-medium">{t(S.minutes)}</span>
          </p>
        </Card>
      </div>

      {mine && mine.status !== "done" && mine.status !== "skipped" ? (
        <Card className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t(S.yourToken)}
          </p>
          <p className="mt-1 text-5xl font-bold tracking-tight text-slate-900">#{mine.number}</p>
          <p className="mt-1 text-sm text-slate-600">{mine.holder}</p>

          {mine.status === "serving" ? (
            <p className="mt-4 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white">
              {t(S.yourTurn)}
            </p>
          ) : ahead <= 1 ? (
            <p className="mt-4 rounded-lg bg-amber-100 px-4 py-3 font-semibold text-amber-900 ring-1 ring-inset ring-amber-300">
              {t(S.approaching)}
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
                <p className="text-2xl font-bold text-slate-900">{ahead}</p>
                <p className="text-xs text-slate-600">{t(S.peopleAhead)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
                <p className="text-2xl font-bold text-slate-900">
                  ~{eta} {t(S.minutes)}
                </p>
                <p className="text-xs text-slate-600">{t(S.estWait)}</p>
              </div>
            </div>
          )}

          <Btn variant="ghost" className="mt-4" onClick={() => skipToken(mine.id)}>
            {t(S.leaveQueue)}
          </Btn>
        </Card>
      ) : (
        <Card className="mt-6">
          <SectionTitle label={S.joinQueue} />
          {mine?.status === "done" && (
            <p className="mb-3 text-sm font-medium text-emerald-700">{t(S.tokenDone)}</p>
          )}
          {mine?.status === "skipped" && (
            <p className="mb-3 text-sm font-medium text-amber-700">{t(S.tokenSkipped)}</p>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              await joinQueue(queueId, name.trim());
              setName("");
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(S.yourName)}
              aria-label={t(S.yourName)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
            <Btn type="submit" disabled={!queue.open}>
              {t(S.joinQueue)}
            </Btn>
          </form>
          <p className="mt-3 text-sm text-slate-500">
            ~{waiting * avg_service_minutes} {t(S.minutes)} · {t(S.estWait)}
          </p>
        </Card>
      )}

      <section className="mt-8">
        <SectionTitle label={S.liveQueue} />
        {tokens.filter((tk) => tk.status === "waiting" || tk.status === "serving").length === 0 ? (
          <Empty label={S.emptyQueue} />
        ) : (
          <Card className="divide-y divide-slate-100 p-0">
            {tokens
              .filter((tk) => tk.status === "waiting" || tk.status === "serving")
              .map((tk) => (
                <div key={tk.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-12 font-mono font-semibold text-slate-900">#{tk.number}</span>
                  {/* Other citizens stay anonymous — only your own name is shown. */}
                  <span className="flex-1 text-sm text-slate-600">
                    {mine && tk.id === mine.id ? tk.holder : "•••"}
                  </span>
                  <Badge tone={tk.status === "serving" ? "green" : "slate"}>
                    {t(tk.status === "serving" ? S.nowServing : S.waiting)}
                  </Badge>
                </div>
              ))}
          </Card>
        )}
      </section>
    </Page>
  );
}
