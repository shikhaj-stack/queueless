"use client";

import Link from "next/link";
import { useLang } from "@/lib/lang";
import { S } from "@/lib/strings";
import type { Service } from "@/lib/types";
import { Badge } from "./ui";

export function ServiceCard({ service }: { service: Service }) {
  const { t } = useLang();
  return (
    <Link
      href={`/services/${service.slug}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-400 hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{t(service.name)}</h3>
          <p className="text-sm text-slate-500">{t(service.department)}</p>
        </div>
        <span className="text-slate-300">→</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {service.online_available && <Badge tone="green">{t(S.onlineAvailable)}</Badge>}
        {service.physical_visit_required && (
          <Badge tone="amber">{t(S.physicalVisit)}</Badge>
        )}
        <Badge>{t(service.fee)}</Badge>
        <Badge>{t(service.processing_time)}</Badge>
      </div>
    </Link>
  );
}
