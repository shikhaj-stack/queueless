"use client";

import { useParams } from "next/navigation";
import { Badge, Btn, Card, Empty, Page, SectionTitle } from "@/components/ui";
import { advanceApplication, getApplication, getService } from "@/lib/api";
import { useLang } from "@/lib/lang";
import { APP_STATUS_LABEL, S } from "@/lib/strings";
import { APP_FLOW } from "@/lib/types";
import { useApi } from "@/lib/useApi";

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const app = useApi(() => getApplication(id), [id]);
  const service = useApi(
    () => (app ? getService(app.service_slug) : Promise.resolve(null)),
    [app?.service_slug],
  );

  if (app === undefined) return <Page back="/applications" backLabel={S.applications} />;
  if (!app)
    return (
      <Page back="/applications" backLabel={S.applications}>
        <Empty />
      </Page>
    );

  const done = APP_FLOW.indexOf(app.status);

  return (
    <Page back="/applications" backLabel={S.applications}>
      <h1 className="text-2xl font-bold text-slate-900">{t(service?.name)}</h1>
      <p className="text-slate-500">{app.applicant_name}</p>

      <Card className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t(S.refNo)}
            </p>
            <p className="font-mono text-lg font-semibold text-slate-900">{app.reference_no}</p>
          </div>
          <Badge tone={app.status === "approved" ? "green" : "blue"}>
            {t(APP_STATUS_LABEL[app.status])}
          </Badge>
        </div>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-inset ring-amber-200">
          {t(S.simulatedRef)}
        </p>
      </Card>

      <section className="mt-8">
        <SectionTitle label={S.timeline} />
        <Card>
          <ol className="relative space-y-6 border-l border-slate-200 pl-6">
            {APP_FLOW.map((status, i) => {
              const entry = app.timeline.find((e) => e.status === status);
              const reached = i <= done;
              return (
                <li key={status}>
                  <span
                    className={`absolute -left-[7px] mt-1 size-3.5 rounded-full ring-2 ring-white ${
                      reached ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                  <p
                    className={`font-medium ${reached ? "text-slate-900" : "text-slate-400"}`}
                  >
                    {t(APP_STATUS_LABEL[status])}
                  </p>
                  {entry && (
                    <>
                      <p className="text-sm text-slate-600">{t(entry.note)}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.at).toLocaleString()}
                      </p>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Btn
          variant="secondary"
          onClick={() => advanceApplication(app.id)}
          disabled={app.status === "approved"}
        >
          {t(S.advanceDemo)} →
        </Btn>
        <Btn variant="ghost" href={`/services/${app.service_slug}`}>
          {t(S.backToService)}
        </Btn>
        {service?.queue_id && app.status === "field_verification" && (
          <Btn href={`/queue/${service.queue_id}`}>{t(S.joinQueueCta)}</Btn>
        )}
      </div>
    </Page>
  );
}
