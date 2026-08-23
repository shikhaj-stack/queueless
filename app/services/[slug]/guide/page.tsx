"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge, Btn, Card, Empty, Page, SectionTitle } from "@/components/ui";
import { askAssistant, getGuide, getService } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { SERVICES } from "@/lib/mock/services";
import { S } from "@/lib/strings";
import { useApi } from "@/lib/useApi";
import type { LText, Visual } from "@/lib/types";

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLang();
  const rawGuide = useApi(() => getGuide(slug), [slug]);
  const rawService = useApi(() => getService(slug), [slug]);
  const service = rawService !== undefined ? rawService : SERVICES.find((s) => s.slug === slug);
  const guide =
    rawGuide !== undefined
      ? rawGuide
      : service
        ? {
            slug: service.slug,
            name: service.name,
            steps: service.steps,
            common_mistakes: service.common_mistakes,
            faqs: service.faqs,
            language_support: service.language_support,
          }
        : null;
  const [i, setI] = useState(0);

  if (guide === undefined) return <Page back={`/services/${slug}`} />;
  if (!guide || guide.steps.length === 0)
    return (
      <Page back={`/services/${slug}`} backLabel={S.backToService}>
        <Empty />
      </Page>
    );

  const step = guide.steps[Math.min(i, guide.steps.length - 1)];
  const last = i === guide.steps.length - 1;

  return (
    <Page back={`/services/${slug}`} backLabel={S.backToService}>
      <h1 className="text-2xl font-bold text-slate-900">{t(guide.name)}</h1>
      <p className="text-slate-500">{t(S.guide)}</p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${((i + 1) / guide.steps.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-slate-600">
          {t(S.stepOf)} {step.number} {t(S.of)} {guide.steps.length}
        </span>
      </div>

      <Card className="mt-5">
        <h2 className="text-lg font-semibold text-slate-900">{t(step.title)}</h2>
        <p className="mt-2 text-slate-700">{t(step.instruction)}</p>

        {step.visual && <VisualFrame visual={step.visual} />}

        {step.tip && (
          <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900 ring-1 ring-inset ring-blue-200">
            <span className="font-semibold">{t(S.tip)}: </span>
            {t(step.tip)}
          </p>
        )}

        <StuckBox slug={slug} step={step.number} />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Btn variant="secondary" onClick={() => setI(i - 1)} disabled={i === 0}>
            ← {t(S.previous)}
          </Btn>
          {last ? (
            <Btn href={service?.queue_id ? `/queue/${service.queue_id}` : "/applications"}>
              {t(S.finishGuide)} →
            </Btn>
          ) : (
            <Btn onClick={() => setI(i + 1)}>{t(S.next)} →</Btn>
          )}
          <Btn variant="secondary" href={`/tutorials?id=${slug}-tutorial`}>
            📸 {t(S.viewTutorial)}
          </Btn>
        </div>
      </Card>

      {/* Step dots double as a jump-to control on wide screens. */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {guide.steps.map((s, idx) => (
          <button
            key={s.number}
            onClick={() => setI(idx)}
            aria-label={`${t(S.stepOf)} ${s.number}`}
            aria-current={idx === i}
            className={`size-8 rounded-lg text-xs font-semibold ${
              idx === i
                ? "bg-slate-900 text-white"
                : idx < i
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-white text-slate-500 ring-1 ring-slate-300"
            }`}
          >
            {s.number}
          </button>
        ))}
      </div>

      <section className="mt-8">
        <SectionTitle label={S.commonMistakes} />
        <Card>
          <ul className="space-y-2 text-sm text-slate-700">
            {guide.common_mistakes.map((m, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-amber-600">!</span>
                {t(m)}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle label={S.faqs} />
        <div className="space-y-2">
          {guide.faqs.map((f, idx) => (
            <details
              key={idx}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <summary className="cursor-pointer font-medium text-slate-900">{t(f.q)}</summary>
              <p className="mt-2 text-sm text-slate-600">{t(f.a)}</p>
            </details>
          ))}
        </div>
      </section>
    </Page>
  );
}

/**
 * Official screenshots and simulated illustrations must never look alike —
 * solid emerald frame vs dashed amber frame, plus an explicit label.
 */
function VisualFrame({ visual }: { visual: Visual }) {
  const { t } = useLang();
  const official = visual.type === "official_screenshot";
  const [x, y, w, h] = visual.highlight?.box ?? [0, 0, 0, 0];

  return (
    <figure className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <Badge tone={official ? "green" : "amber"}>
          {official ? `◉ ${t(S.officialScreenshot)}` : `✎ ${t(S.simulatedVisual)}`}
        </Badge>
      </div>
      <div
        className={`relative overflow-hidden rounded-lg bg-slate-50 ${
          official
            ? "border-2 border-emerald-500"
            : "border-2 border-dashed border-amber-500"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG mock assets */}
        <img src={visual.asset} alt="" className="block w-full" />
        {visual.highlight && (
          <>
            <span
              className="pointer-events-none absolute animate-pulse rounded-md ring-4 ring-red-500"
              style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
            />
            <span
              className="pointer-events-none absolute -translate-y-full rounded-md bg-red-600 px-2 py-1 text-xs font-semibold whitespace-nowrap text-white"
              style={{ left: `${x}%`, top: `calc(${y}% - 6px)` }}
            >
              ↓ {t(visual.highlight.label)}
            </span>
          </>
        )}
      </div>
    </figure>
  );
}

function StuckBox({ slug, step }: { slug: string; step: number }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<LText | null>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 text-sm font-semibold text-blue-700 underline underline-offset-2"
      >
        {t(S.stuck)}?
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-lg bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
      <p className="text-sm font-semibold text-slate-900">{t(S.stuckHelp)}</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label={t(S.stuckHelp)}
        />
        <Btn
          onClick={async () => {
            const r = await askAssistant({ slug, step, question: q });
            setAnswer(r.answer);
          }}
        >
          {t(S.askAssistant)}
        </Btn>
      </div>
      {answer && (
        <p className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200">
          {t(answer)}
        </p>
      )}
    </div>
  );
}
