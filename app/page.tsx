"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { Empty, Page, SectionTitle } from "@/components/ui";
import { getDepartments, searchServices } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { S } from "@/lib/strings";
import { useApi } from "@/lib/useApi";

export default function HomePage() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");

  const departments = useApi(() => getDepartments(), []) ?? [];
  const results = useApi(() => searchServices(q, dept || undefined), [q, dept]) ?? [];
  const popular = results.filter((s) => s.popular);
  const searching = q.trim().length > 0 || dept !== "";

  return (
    <Page>
      <section className="mb-8 rounded-2xl bg-slate-900 px-6 py-10 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">{t(S.appName)}</h1>
        <p className="mt-2 max-w-lg text-slate-300">{t(S.tagline)}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(S.searchPlaceholder)}
            aria-label={t(S.search)}
            className="w-full rounded-lg bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-offset-2 focus:outline-amber-400"
          />
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            aria-label={t(S.browseByDept)}
            className="rounded-lg bg-white px-4 py-3 text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-amber-400"
          >
            <option value="">{t(S.allDepartments)}</option>
            {departments.map((d) => (
              <option key={d.en} value={d.en}>
                {t(d)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {!searching && popular.length > 0 && (
        <section className="mb-8">
          <SectionTitle label={S.popular} />
          <div className="grid gap-3 sm:grid-cols-2">
            {popular.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Visual Tutorials Section */}
      {!searching && (
        <section className="mb-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/70 p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  New Feature
                </span>
                <span className="text-xs font-semibold text-indigo-900">
                  {t(S.tutorialBadge)}
                </span>
              </div>
              <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl">
                {t(S.tutorialHub)}
              </h2>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-600">
                {t(S.tutorialTagline)}
              </p>
            </div>
            <a
              href="/tutorials"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              {t(S.exploreTutorials)} →
            </a>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <a
              href="/tutorials?id=domicile-certificate-tutorial"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/guides/domicile-form-mock.svg"
                    alt="Domicile Form Tutorial"
                    className="size-full object-cover object-top opacity-90 transition group-hover:scale-105"
                  />
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    5 Hotspots
                  </span>
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                  {t({ en: "Domicile Certificate Form", hi: "मूल निवासी प्रमाण पत्र फॉर्म" })}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Samagra ID • Address • 10-Yr stay
                </p>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-indigo-600">
                View Screenshot Guide →
              </span>
            </a>

            <a
              href="/tutorials?id=income-certificate-tutorial"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/guides/income-form-mock.svg"
                    alt="Income Form Tutorial"
                    className="size-full object-cover object-top opacity-90 transition group-hover:scale-105"
                  />
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    3 Hotspots
                  </span>
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                  {t({ en: "Income Certificate Form", hi: "आय प्रमाण पत्र फॉर्म" })}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Family income assessment • Salary slip
                </p>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-indigo-600">
                View Screenshot Guide →
              </span>
            </a>

            <a
              href="/tutorials?id=birth-certificate-tutorial"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/guides/birth-form-mock.svg"
                    alt="Birth Form Tutorial"
                    className="size-full object-cover object-top opacity-90 transition group-hover:scale-105"
                  />
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    Free 21 Days
                  </span>
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                  {t({ en: "Birth Registration (CRS)", hi: "जन्म पंजीयन (सीआरएस)" })}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500">
                  Hospital discharge • Parents&apos; Aadhaar
                </p>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-indigo-600">
                View Screenshot Guide →
              </span>
            </a>
          </div>
        </section>
      )}

      <section>
        <SectionTitle
          label={searching ? S.search : S.browseByDept}
          hint={{
            en: `${results.length} ${S.resultsCount.en}`,
            hi: `${results.length} ${S.resultsCount.hi}`,
          }}
        />
        {results.length === 0 ? (
          <Empty label={S.noResults} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
