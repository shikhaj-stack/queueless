"use client";

import { useState } from "react";
import { Badge, Btn, Card, Empty, LevelPill, Page, SectionTitle } from "@/components/ui";
import {
  compileService,
  flagService,
  getDrafts,
  getServices,
  getVerificationReports,
  publishService,
  verifyService,
} from "@/lib/api";
import { SERVICES } from "@/lib/mock/services";
import { useLang } from "@/lib/lang";
import { S } from "@/lib/strings";
import { useDB } from "@/lib/store";
import { useApi } from "@/lib/useApi";
import type { CheckLevel, Service } from "@/lib/types";

export default function AdminPage() {
  const { t } = useLang();
  const db = useDB();
  const published = useApi(() => getServices(), []) ?? [];
  const drafts = useApi(() => getDrafts(), []) ?? {};

  const [slug, setSlug] = useState(SERVICES[0]?.slug ?? "");
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("");
  const [busy, setBusy] = useState<"" | "compile" | "verify">("");
  const [note, setNote] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [publishError, setPublishError] = useState(false);

  const target = newName.trim()
    ? newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : slug;
  const draft: Service | undefined = drafts[target];
  const reports = useApi(() => getVerificationReports(target), [target]) ?? [];
  const latest = reports[0];
  const isPublished = db.published.includes(target);

  return (
    <Page>
      <h1 className="text-2xl font-bold text-slate-900">{t(S.serviceOps)}</h1>
      <p className="text-slate-500">
        {published.length} published · {Object.keys(drafts).length} draft
      </p>

      <Card className="mt-6">
        <SectionTitle label={S.compile} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-slate-500">Existing service</span>
            <select
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setNewName("");
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
            >
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {t(s.name)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-500">…or compile a new one</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Ration Card Transfer"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </label>
          {newName.trim() && (
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-slate-500">Department</span>
              <input
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="e.g. Food & Civil Supplies"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn
            disabled={busy !== ""}
            onClick={async () => {
              setBusy("compile");
              setPublishError(false);
              await compileService(
                newName.trim()
                  ? { name: newName.trim(), department: newDept.trim() }
                  : { slug, name: slug, department: "" },
              );
              setBusy("");
            }}
          >
            {t(busy === "compile" ? S.compiling : S.compile)}
          </Btn>
          <Btn
            variant="secondary"
            disabled={!draft || busy !== ""}
            onClick={async () => {
              setBusy("verify");
              setPublishError(false);
              await verifyService(target);
              setBusy("");
            }}
          >
            {t(busy === "verify" ? S.verifying : S.runVerification)}
          </Btn>
        </div>
      </Card>

      <section className="mt-8">
        <SectionTitle label={S.draftSpec} />
        {!draft ? (
          <Empty />
        ) : (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{t(draft.name)}</p>
                <p className="text-sm text-slate-500">
                  {t(draft.department)} · {draft.slug}
                </p>
              </div>
              <Badge tone={isPublished ? "green" : "amber"}>
                {t(isPublished ? S.published : S.draftSpec)}
              </Badge>
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {[
                ["Steps", draft.steps.length],
                ["Requirements", draft.requirements.length],
                ["Sources", draft.official_sources.length],
                ["FAQs", draft.faqs.length],
                ["Fee", t(draft.fee) || "—"],
                ["Processing time", t(draft.processing_time) || "—"],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between border-b border-slate-100 py-1">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-600">
                Raw spec
              </summary>
              <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                {JSON.stringify(draft, null, 2)}
              </pre>
            </details>
          </Card>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle label={S.healthReport} />
        {!latest ? (
          <Empty label={S.noReport} />
        ) : (
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-500">{t(S.verdict)}</span>
              <LevelPill level={latest.verdict} />
              <span className="ml-auto flex gap-1.5 text-xs">
                {(["PASS", "WARN", "BLOCKER"] as CheckLevel[]).map((lvl) => (
                  <span key={lvl} className="text-slate-500">
                    {lvl} {latest.counts[lvl]}
                  </span>
                ))}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {latest.checks.map((c) => (
                <li key={c.id} className="flex gap-3 py-3">
                  <span className="w-20 shrink-0">
                    <LevelPill level={c.level} />
                  </span>
                  <span>
                    <span className="block font-medium text-slate-900">{t(c.label)}</span>
                    <span className="block text-sm text-slate-600">{t(c.detail)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Btn
                disabled={isPublished || latest.counts.BLOCKER > 0}
                onClick={async () => {
                  const r = await publishService(target);
                  setPublishError(!r.ok);
                }}
              >
                {t(isPublished ? S.published : S.publish)}
              </Btn>
              {(latest.counts.BLOCKER > 0 || publishError) && (
                <span className="text-sm font-medium text-red-700">{t(S.publishBlocked)}</span>
              )}
            </div>
          </Card>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle label={S.history} />
        {reports.length === 0 ? (
          <Empty />
        ) : (
          <Card className="divide-y divide-slate-100 p-0">
            {reports.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <LevelPill level={r.verdict} />
                <span className="text-slate-600">{new Date(r.ran_at).toLocaleString()}</span>
                <span className="ml-auto text-slate-500">
                  {r.counts.PASS} pass · {r.counts.WARN} warn · {r.counts.BLOCKER} blocker
                </span>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle label={S.flag} />
        <Card>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!note.trim()) return;
              await flagService(target, note.trim());
              setNote("");
              setFlagged(true);
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. fee changed to ₹50 on the portal"
              aria-label={t(S.flag)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
            <Btn type="submit" variant="secondary">
              {t(S.flag)}
            </Btn>
          </form>
          {flagged && <p className="mt-2 text-sm text-emerald-700">{t(S.flagged)}</p>}
          {db.flags.filter((f) => f.service_slug === target).length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {db.flags
                .filter((f) => f.service_slug === target)
                .map((f) => (
                  <li key={f.id}>
                    • {f.note}{" "}
                    <span className="text-xs text-slate-400">
                      {new Date(f.at).toLocaleString()}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </section>
    </Page>
  );
}
