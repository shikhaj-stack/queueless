"use client";

import { useParams } from "next/navigation";
import { Badge, Btn, Card, Empty, Page, SectionTitle } from "@/components/ui";
import { getLocations, getService, toggleChecked, toggleSaved } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { SERVICES } from "@/lib/mock/services";
import { useDB } from "@/lib/store";
import { S } from "@/lib/strings";
import { useApi } from "@/lib/useApi";

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLang();
  const db = useDB();
  const rawService = useApi(() => getService(slug), [slug]);
  const service = rawService !== undefined ? rawService : SERVICES.find((s) => s.slug === slug);
  const locations = useApi(() => getLocations(slug), [slug]) ?? [];

  if (service === undefined) return <Page back="/" />;
  if (!service)
    return (
      <Page back="/">
        <Empty />
      </Page>
    );

  const checked = db.checked[service.slug] ?? [];
  const isSaved = db.saved.includes(service.slug);

  return (
    <Page back="/" backLabel={S.home}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t(service.name)}</h1>
          <p className="text-slate-500">{t(service.department)}</p>
        </div>
        <Btn variant={isSaved ? "primary" : "secondary"} onClick={() => toggleSaved(service.slug)}>
          {isSaved ? `★ ${t(S.saved)}` : `☆ ${t(S.saveService)}`}
        </Btn>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {service.online_available && <Badge tone="green">{t(S.onlineAvailable)}</Badge>}
        {service.physical_visit_required && <Badge tone="amber">{t(S.physicalVisit)}</Badge>}
        {service.verification.status !== "verified" && (
          <Badge tone="amber">
            {service.verification.status === "needs_review"
              ? "Needs review"
              : "Last checked " + service.verification.last_checked}
          </Badge>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t(S.fee)}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{t(service.fee)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t(S.processingTime)}
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{t(service.processing_time)}</p>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Btn href={`/services/${service.slug}/guide`}>{t(S.openGuide)}</Btn>
        <Btn variant="secondary" href={`/tutorials?id=${service.slug}-tutorial`}>
          📸 {t(S.viewTutorial)}
        </Btn>
        <Btn variant="secondary" href={`/applications?service=${service.slug}`}>
          {t(S.startApplication)}
        </Btn>
        {service.queue_id && (
          <Btn variant="secondary" href={`/queue/${service.queue_id}`}>
            {t(S.joinQueueCta)}
          </Btn>
        )}
      </div>

      {/* Visual Form Tutorial Callout */}
      <div className="mt-6 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Screenshot Guide
              </span>
              <span className="text-xs font-semibold text-indigo-950">
                Never get your form rejected
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-700">
              View the step-by-step screenshot walkthrough with clickable field instructions &amp; practice simulator.
            </p>
          </div>
          <Btn href={`/tutorials?id=${service.slug}-tutorial`} variant="primary" className="text-xs">
            Open Visual Guide →
          </Btn>
        </div>
      </div>

      <section className="mt-8">
        <SectionTitle label={S.eligibility} />
        <Card>
          <ul className="space-y-2 text-sm text-slate-700">
            {service.eligibility.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-600">✓</span>
                {t(e)}
              </li>
            ))}
            {service.eligibility.length === 0 && <Empty />}
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle label={S.requirements} />
        <Card className="divide-y divide-slate-100 p-0">
          {service.requirements.map((r) => {
            const on = checked.includes(r.name.en);
            return (
              <label
                key={r.name.en}
                className="flex cursor-pointer items-start gap-3 p-4 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleChecked(service.slug, r.name.en)}
                  className="mt-1 size-4 accent-slate-900"
                />
                <span className="flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-medium ${on ? "text-slate-400 line-through" : "text-slate-900"}`}
                    >
                      {t(r.name)}
                    </span>
                    <Badge tone={r.required ? "red" : "slate"}>
                      {t(r.required ? S.required : S.optional)}
                    </Badge>
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{t(r.explanation)}</span>
                </span>
              </label>
            );
          })}
          {service.requirements.length === 0 && (
            <div className="p-4">
              <Empty />
            </div>
          )}
        </Card>
      </section>

      {locations.length > 0 && (
        <section className="mt-8">
          <SectionTitle label={S.location} />
          <div className="grid gap-3 sm:grid-cols-2">
            {locations.map((l) => (
              <Card key={l.id}>
                <p className="font-medium text-slate-900">{t(l.name)}</p>
                <p className="text-sm text-slate-600">{t(l.address)}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <SectionTitle label={S.commonMistakes} />
        <Card>
          <ul className="space-y-2 text-sm text-slate-700">
            {service.common_mistakes.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-600">!</span>
                {t(m)}
              </li>
            ))}
            {service.common_mistakes.length === 0 && <Empty />}
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle label={S.faqs} />
        <div className="space-y-2">
          {service.faqs.map((f, i) => (
            <details
              key={i}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <summary className="cursor-pointer font-medium text-slate-900">{t(f.q)}</summary>
              <p className="mt-2 text-sm text-slate-600">{t(f.a)}</p>
            </details>
          ))}
          {service.faqs.length === 0 && <Empty />}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle label={S.officialSources} />
        <Card>
          <ul className="space-y-2 text-sm">
            {service.official_sources.map((src) => (
              <li key={src.url}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-700 underline underline-offset-2"
                >
                  {src.title}
                </a>
                <span className="text-slate-500">
                  {" "}
                  — {t(S.accessedOn)} {src.accessed_at}
                </span>
              </li>
            ))}
            {service.official_sources.length === 0 && <Empty />}
          </ul>
        </Card>
      </section>
    </Page>
  );
}
