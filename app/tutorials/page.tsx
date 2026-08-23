"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FormTutorialViewer } from "@/components/FormTutorialViewer";
import { Badge, Btn, Card, Empty, Page, SectionTitle } from "@/components/ui";
import { getTutorials } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { TUTORIALS } from "@/lib/mock/tutorials";
import { S } from "@/lib/strings";
import type { FormTutorial } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function TutorialsPage() {
  return (
    <Suspense>
      <TutorialsHub />
    </Suspense>
  );
}

function TutorialsHub() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const apiTutorials = useApi(() => getTutorials(), []);
  const tutorials = apiTutorials ?? TUTORIALS;
  const selectedTutorialIdFromUrl = searchParams.get("id");

  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTutorial, setSelectedTutorial] = useState<FormTutorial | null>(null);

  // Auto-select tutorial if passed in URL
  const activeTutorial =
    selectedTutorial ||
    (selectedTutorialIdFromUrl
      ? tutorials.find((tut) => tut.id === selectedTutorialIdFromUrl)
      : null);

  const categories = Array.from(
    new Set(tutorials.map((tut) => tut.category.en)),
  );

  const filteredTutorials = tutorials.filter((tut) => {
    if (categoryFilter !== "all" && tut.category.en !== categoryFilter) {
      return false;
    }
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      tut.title.en.toLowerCase().includes(needle) ||
      (tut.title.hi && tut.title.hi.toLowerCase().includes(needle)) ||
      tut.portal_name.en.toLowerCase().includes(needle) ||
      tut.service_slug.toLowerCase().includes(needle)
    );
  });

  return (
    <Page>
      {/* If a tutorial is currently open for full view */}
      {activeTutorial ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedTutorial(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            ← {t(S.allTutorials)}
          </button>
          <FormTutorialViewer tutorial={activeTutorial} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hero Banner */}
          <section className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-9 text-white shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-inset ring-blue-400/30">
                📸 Visual Walkthroughs &amp; Simulator
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              {t(S.tutorialHub)}
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300">
              {t(S.tutorialTagline)}
            </p>

            {/* Search & Filters */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t({
                  en: "Search tutorial, e.g. Domicile, Income, Samagra...",
                  hi: "ट्यूटोरियल खोजें, जैसे मूल निवासी, आय, समग्र...",
                })}
                aria-label={t(S.search)}
                className="w-full rounded-lg bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-400"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label={t(S.filterByCategory)}
                className="rounded-lg bg-white px-4 py-3 text-sm text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-blue-400"
              >
                <option value="all">{t(S.allCategories)}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Quick Categories Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                categoryFilter === "all"
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t(S.allTutorials)} ({tutorials.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white font-semibold shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tutorial Cards Grid */}
          <section>
            <SectionTitle
              label={{
                en: `Available Guides (${filteredTutorials.length})`,
                hi: `उपलब्ध गाइड्स (${filteredTutorials.length})`,
              }}
            />

            {filteredTutorials.length === 0 ? (
              <Empty label={S.noResults} />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredTutorials.map((tut) => (
                  <Card
                    key={tut.id}
                    className="flex flex-col justify-between overflow-hidden border-slate-200 p-0 transition-all hover:border-slate-400 hover:shadow-md"
                  >
                    {/* Visual Screenshot Header Preview */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 border-b border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tut.steps[0]?.screenshot_asset || "/guides/form-fields.svg"}
                        alt={t(tut.title)}
                        className="size-full object-cover object-top opacity-90 transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <Badge tone="blue">{t(tut.category)}</Badge>
                        <Badge
                          tone={
                            tut.difficulty === "easy"
                              ? "green"
                              : tut.difficulty === "medium"
                                ? "amber"
                                : "red"
                          }
                        >
                          {t(S[tut.difficulty])}
                        </Badge>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="font-medium drop-shadow">
                          ⏱️ {t(tut.estimated_time)} • {tut.steps.length} Steps
                        </span>
                        <span className="rounded bg-black/60 px-2 py-0.5 font-semibold text-[11px] backdrop-blur">
                          {tut.steps.reduce((acc, s) => acc + s.hotspots.length, 0)} Annotated Fields
                        </span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          {t(tut.title)}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                          Portal: {t(tut.portal_name)}
                        </p>
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                          {t(tut.summary)}
                        </p>

                        {/* Top Key Features Pill */}
                        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                            🎯 Hotspot Callouts
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                            ✍️ Practice Simulator
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">
                            📄 200KB Scan Guide
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <Btn
                          variant="primary"
                          onClick={() => setSelectedTutorial(tut)}
                          className="w-full"
                        >
                          👁️ {t(S.viewTutorial)} →
                        </Btn>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Informational Guidance Section: Top Mistakes */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
            <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <span>⚠️</span> Why Do Government Forms Get Rejected in Bhopal?
            </h2>
            <p className="mt-1 text-xs text-amber-900">
              Citizens often lose weeks waiting in queues simply because of avoidable mistakes on the online portal:
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4 shadow-xs border border-amber-200">
                <p className="text-xs font-bold text-slate-900">1. Aadhaar Name Mismatch</p>
                <p className="mt-1 text-xs text-slate-600">
                  Using abbreviations or spelling variants compared to electricity bill or school marksheets.
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-xs border border-amber-200">
                <p className="text-xs font-bold text-slate-900">2. Blurry Document Scans</p>
                <p className="mt-1 text-xs text-slate-600">
                  Phone photos with flash glares or files &gt; 200 KB that portal servers cannot process.
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-xs border border-amber-200">
                <p className="text-xs font-bold text-slate-900">3. Wrong Samagra ID</p>
                <p className="mt-1 text-xs text-slate-600">
                  Entering 8-digit family number instead of individual 9-digit member number.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </Page>
  );
}
