"use client";

import Link from "next/link";
import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { Badge, Btn, Card, Empty, Page, SectionTitle } from "@/components/ui";
import { demoLogin, getDashboard } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { APP_STATUS_LABEL, S } from "@/lib/strings";
import { useApi } from "@/lib/useApi";

export default function DashboardPage() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const data = useApi(() => getDashboard(), []);

  if (!data) return <Page />;

  return (
    <Page>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t(S.dashboard)}</h1>
        {data.user ? (
          <Badge tone="blue">
            {t(S.signedInAs)} {data.user.name}
          </Badge>
        ) : null}
      </div>

      {!data.user && (
        <Card className="mt-5">
          <SectionTitle label={S.demoLogin} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) demoLogin(name.trim());
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
            <Btn type="submit">{t(S.demoLogin)}</Btn>
          </form>
        </Card>
      )}

      <section className="mt-8">
        <SectionTitle label={S.activeToken} />
        {data.active_token ? (
          <Link href={`/queue/${data.active_token.queue_id}`} className="block">
            <Card className="flex items-center justify-between hover:border-slate-400">
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  #{data.active_token.number}
                </p>
                <p className="text-sm text-slate-500">{data.active_token.holder}</p>
              </div>
              <Badge tone={data.active_token.status === "serving" ? "green" : "amber"}>
                {t(data.active_token.status === "serving" ? S.yourTurn : S.waiting)}
              </Badge>
            </Card>
          </Link>
        ) : (
          <Empty />
        )}
      </section>

      <section className="mt-8">
        <SectionTitle label={S.applications} />
        {data.applications.length === 0 ? (
          <Empty label={S.noApplications} />
        ) : (
          <div className="space-y-2">
            {data.applications.map((a) => (
              <Link
                key={a.id}
                href={`/applications/${a.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-400"
              >
                <span className="font-mono text-sm text-slate-600">{a.reference_no}</span>
                <Badge tone={a.status === "approved" ? "green" : "blue"}>
                  {t(APP_STATUS_LABEL[a.status])}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle label={S.pendingDocs} />
        {data.pending_documents.length === 0 ? (
          <Empty />
        ) : (
          <Card className="divide-y divide-slate-100 p-0">
            {data.pending_documents.map((p, i) => (
              <Link
                key={i}
                href={`/services/${p.service_slug}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
              >
                <span>
                  <span className="block font-medium text-slate-900">{t(p.requirement.name)}</span>
                  <span className="block text-xs text-slate-500">{t(p.service_name)}</span>
                </span>
                <Badge tone="red">{t(S.required)}</Badge>
              </Link>
            ))}
          </Card>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle label={S.savedServices} />
        {data.saved_services.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.saved_services.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
