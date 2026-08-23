"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Badge, Btn, Card, Empty, Page, SectionTitle } from "@/components/ui";
import { createApplication, getServices, getUserApplications } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { APP_STATUS_LABEL, S } from "@/lib/strings";
import { useApi } from "@/lib/useApi";

export default function ApplicationsPage() {
  return (
    <Suspense>
      <Applications />
    </Suspense>
  );
}

function Applications() {
  const { t } = useLang();
  const params = useSearchParams();
  const services = useApi(() => getServices(), []) ?? [];
  const applications = useApi(() => getUserApplications(), []) ?? [];

  const [slug, setSlug] = useState(params.get("service") ?? "");
  const [name, setName] = useState("");
  const nameOf = (s: string) => services.find((x) => x.slug === s)?.name;

  const chosen = slug || services[0]?.slug || "";

  return (
    <Page>
      <h1 className="text-2xl font-bold text-slate-900">{t(S.tracker)}</h1>
      <p className="text-slate-500">{t(S.simulatedRef)}</p>

      <Card className="mt-6">
        <SectionTitle label={S.startApplication} />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !chosen) return;
            await createApplication(chosen, name.trim());
            setName("");
          }}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <select
            value={chosen}
            onChange={(e) => setSlug(e.target.value)}
            aria-label={t(S.search)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {t(s.name)}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(S.applicantName)}
            aria-label={t(S.applicantName)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
          <Btn type="submit">{t(S.submit)}</Btn>
        </form>
      </Card>

      <section className="mt-8">
        <SectionTitle label={S.applications} />
        {applications.length === 0 ? (
          <Empty label={S.noApplications} />
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <Link
                key={a.id}
                href={`/applications/${a.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-400"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{t(nameOf(a.service_slug))}</p>
                    <p className="font-mono text-xs text-slate-500">
                      {t(S.refNo)} {a.reference_no}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={a.status === "approved" ? "green" : "blue"}>
                      {t(APP_STATUS_LABEL[a.status])}
                    </Badge>
                    <span className="text-sm text-slate-400">{t(S.viewDetails)} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
