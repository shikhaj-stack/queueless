"use client";

import { useState } from "react";
import { Badge, Btn, Card, Empty, Page, SectionTitle } from "@/components/ui";
import {
  callNext,
  completeToken,
  getLocations,
  getQueue,
  getQueues,
  getService,
  resetQueue,
  setQueueOpen,
  skipToken,
} from "@/lib/api";
import { useLang } from "@/lib/lang";
import { S } from "@/lib/strings";
import { useApi } from "@/lib/useApi";

export default function StaffPage() {
  const { t } = useLang();
  const queues = useApi(() => getQueues(), []) ?? [];
  const [selected, setSelected] = useState("");
  const queueId = selected || queues[0]?.id || "";

  const view = useApi(
    () => (queueId ? getQueue(queueId) : Promise.resolve(null)),
    [queueId],
  );
  const service = useApi(
    () => (view ? getService(view.queue.service_slug) : Promise.resolve(null)),
    [view?.queue.service_slug],
  );
  const locations = useApi(() => getLocations(), []) ?? [];

  if (view === undefined) return <Page />;
  if (!view)
    return (
      <Page>
        <Empty />
      </Page>
    );

  const { queue, tokens, now_serving, waiting, avg_service_minutes } = view;
  const location = locations.find((l) => l.id === queue.location_id);
  const line = tokens.filter((tk) => tk.status === "waiting");

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t(S.staffDashboard)}</h1>
          <p className="text-slate-500">
            {t(service?.name)}
            {location ? ` • ${t(location.name)}` : ""}
          </p>
        </div>
        <label className="text-sm">
          <span className="mr-2 text-slate-500">{t(S.selectQueue)}</span>
          <select
            value={queueId}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            {queues.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Card className="bg-slate-900 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t(S.nowServing)}
          </p>
          <p className="mt-1 text-4xl font-bold">
            {now_serving ? `#${now_serving.number}` : "—"}
          </p>
          {now_serving && <p className="text-sm text-slate-300">{now_serving.holder}</p>}
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t(S.waiting)}
          </p>
          <p className="mt-1 text-4xl font-bold text-slate-900">{waiting}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t(S.avgService)}
          </p>
          <p className="mt-1 text-4xl font-bold text-slate-900">
            {avg_service_minutes} <span className="text-base font-medium">{t(S.minutes)}</span>
          </p>
        </Card>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Btn onClick={() => callNext(queue.id)} disabled={!queue.open || line.length === 0}>
          {t(S.callNext)}
        </Btn>
        <Btn
          variant="secondary"
          onClick={() => now_serving && completeToken(now_serving.id)}
          disabled={!now_serving}
        >
          {t(S.complete)}
        </Btn>
        <Btn
          variant="secondary"
          onClick={() => now_serving && skipToken(now_serving.id)}
          disabled={!now_serving}
        >
          {t(S.skip)}
        </Btn>
        <Btn variant="ghost" onClick={() => setQueueOpen(queue.id, !queue.open)}>
          {t(queue.open ? S.pauseCounter : S.resumeCounter)}
        </Btn>
        <Btn
          variant="danger"
          className="ml-auto"
          onClick={() => {
            if (confirm(t(S.resetConfirm))) resetQueue(queue.id);
          }}
        >
          {t(S.resetQueue)}
        </Btn>
      </div>
      {!queue.open && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-800 ring-1 ring-inset ring-red-200">
          {t(S.queueClosed)}
        </p>
      )}

      <section className="mt-8">
        <SectionTitle label={S.liveQueue} />
        {tokens.length === 0 ? (
          <Empty label={S.emptyQueue} />
        ) : (
          <Card className="divide-y divide-slate-100 p-0">
            {tokens.map((tk) => (
              <div key={tk.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="w-12 font-mono font-semibold text-slate-900">#{tk.number}</span>
                <span className="flex-1 text-sm text-slate-700">{tk.holder}</span>
                <span className="text-xs text-slate-400">
                  {new Date(tk.joined_at).toLocaleTimeString()}
                </span>
                <Badge
                  tone={
                    tk.status === "serving"
                      ? "green"
                      : tk.status === "waiting"
                        ? "blue"
                        : tk.status === "skipped"
                          ? "amber"
                          : "slate"
                  }
                >
                  {tk.status}
                </Badge>
              </div>
            ))}
          </Card>
        )}
      </section>
    </Page>
  );
}
