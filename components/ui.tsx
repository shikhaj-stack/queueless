"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { resetDemo } from "@/lib/api";
import { LangToggle, useLang } from "@/lib/lang";
import { S } from "@/lib/strings";
import type { CheckLevel, LText } from "@/lib/types";

const TONES = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
} as const;

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const LEVEL_TONE: Record<CheckLevel, keyof typeof TONES> = {
  PASS: "green",
  WARN: "amber",
  BLOCKER: "red",
};

export function LevelPill({ level }: { level: CheckLevel }) {
  return <Badge tone={LEVEL_TONE[level]}>{level}</Badge>;
}

export function Btn({
  children,
  onClick,
  href,
  variant = "primary",
  disabled,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    secondary: "bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-500",
  }[variant];
  const cls = `${base} ${styles} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ label, hint }: { label: LText; hint?: LText }) {
  const { t } = useLang();
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold text-slate-900">{t(label)}</h2>
      {hint && <p className="text-sm text-slate-500">{t(hint)}</p>}
    </div>
  );
}

export function Empty({ label }: { label?: LText }) {
  const { t } = useLang();
  return (
    <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      {t(label ?? S.nothingHere)}
    </p>
  );
}

const NAV = [
  { href: "/", label: S.home },
  { href: "/tutorials", label: S.tutorials },
  { href: "/applications", label: S.applications },
  { href: "/dashboard", label: S.dashboard },
  { href: "/staff", label: S.staff },
  { href: "/admin", label: S.admin },
];

export function Nav() {
  const { t } = useLang();
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="mr-auto flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            Q
          </span>
          <span className="font-semibold text-slate-900">{t(S.appName)}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-2.5 py-1.5 ${
                  active
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t(n.label)}
              </Link>
            );
          })}
        </nav>
        <LangToggle />
      </div>
      <DemoBanner />
    </header>
  );
}

function DemoBanner() {
  const { t } = useLang();
  return (
    <div className="border-t border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">
      {t(S.demoBanner)}{" "}
      <button
        onClick={() => {
          if (confirm(t(S.resetAllConfirm))) resetDemo();
        }}
        className="font-semibold underline underline-offset-2 hover:no-underline"
      >
        {t(S.resetAll)}
      </button>
    </div>
  );
}

/** Consistent page shell: max width, padding, optional back link. */
export function Page({
  children,
  back,
  backLabel,
}: {
  children?: ReactNode;
  back?: string;
  backLabel?: LText;
}) {
  const { t } = useLang();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      {back && (
        <Link
          href={back}
          className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
        >
          ← {t(backLabel ?? S.home)}
        </Link>
      )}
      {children}
    </main>
  );
}
