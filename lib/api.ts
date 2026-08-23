"use client";

/**
 * Mock API layer. One function per endpoint in the agreed contract, same
 * arguments and same return shapes. Swapping to the real backend means
 * replacing each body with a fetch() — no component changes.
 *
 * e.g.  export const getService = (slug: string) =>
 *          fetch(`/api/services/${slug}`).then(r => r.json());
 */

import { LOCATIONS, SERVICES } from "./mock/services.ts";
import { TUTORIALS } from "./mock/tutorials.ts";
import { newId, read, resetAll, write } from "./store.ts";
import {
  APP_FLOW,
  L,
  type Application,
  type AppStatus,
  type CheckLevel,
  type Flag,
  type FormTutorial,
  type HealthCheck,
  type Location,
  type Queue,
  type QueueView,
  type Service,
  type Token,
  type VerificationReport,
} from "./types.ts";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const nowIso = () => new Date().toISOString();

// --- GET /services, /services/:slug, POST /services/search ------------------

export async function getServices(): Promise<Service[]> {
  const { published, drafts } = read();
  return SERVICES.concat(Object.values(drafts))
    .filter((s) => published.includes(s.slug))
    .map(clone);
}

export async function getService(slug: string): Promise<Service | null> {
  const { drafts } = read();
  return clone(SERVICES.find((s) => s.slug === slug) ?? drafts[slug] ?? null);
}

/** POST /services/search — body: { q, department } */
export async function searchServices(
  q: string,
  department?: string,
): Promise<Service[]> {
  const needle = q.trim().toLowerCase();
  const all = await getServices();
  return all.filter((s) => {
    if (department && s.department.en !== department) return false;
    if (!needle) return true;
    // Match either language plus the department, so Hindi search works too.
    const hay = [
      s.name.en,
      s.name.hi,
      s.department.en,
      s.department.hi,
      s.slug,
      ...s.requirements.map((r) => r.name.en),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

/** GET /services/:slug/guide */
export async function getGuide(slug: string) {
  const s = await getService(slug);
  if (!s) return null;
  return {
    slug: s.slug,
    name: s.name,
    steps: s.steps,
    common_mistakes: s.common_mistakes,
    faqs: s.faqs,
    language_support: s.language_support,
  };
}

/** GET /departments */
export async function getDepartments() {
  const all = await getServices();
  const seen = new Map<string, Service["department"]>();
  all.forEach((s) => seen.set(s.department.en, s.department));
  return [...seen.values()];
}

/** GET /locations?serviceId= */
export async function getLocations(serviceId?: string): Promise<Location[]> {
  return LOCATIONS.filter(
    (l) => !serviceId || l.service_slugs.includes(serviceId),
  ).map(clone);
}

// --- Tutorials -------------------------------------------------------------

/** GET /tutorials */
export async function getTutorials(): Promise<FormTutorial[]> {
  return TUTORIALS.map(clone);
}

/** GET /tutorials/:id */
export async function getTutorial(id: string): Promise<FormTutorial | null> {
  const tut = TUTORIALS.find((t) => t.id === id);
  return tut ? clone(tut) : null;
}

/** GET /tutorials/by-service/:slug */
export async function getTutorialByService(slug: string): Promise<FormTutorial | null> {
  const tut = TUTORIALS.find((t) => t.service_slug === slug);
  return tut ? clone(tut) : null;
}

// --- Applications ----------------------------------------------------------

/** POST /applications */
export async function createApplication(
  service_slug: string,
  applicant_name: string,
): Promise<Application> {
  const app: Application = {
    id: newId("app"),
    // Prefixed DEMO so nobody mistakes it for a real government reference.
    reference_no: `DEMO-MP-${new Date().getFullYear()}-${String(
      read().applications.length + 1,
    ).padStart(5, "0")}`,
    service_slug,
    applicant_name,
    status: "submitted",
    created_at: nowIso(),
    timeline: [
      {
        status: "submitted",
        at: nowIso(),
        note: L("Application received.", "आवेदन प्राप्त हुआ।"),
      },
    ],
  };
  write((d) => d.applications.unshift(app));
  return clone(app);
}

/** GET /applications/:id */
export async function getApplication(id: string) {
  return clone(read().applications.find((a) => a.id === id) ?? null);
}

/** GET /users/:id/applications */
export async function getUserApplications() {
  return clone(read().applications);
}

const APP_NOTES: Record<AppStatus, { en: string; hi?: string }> = {
  submitted: L("Application received.", "आवेदन प्राप्त हुआ।"),
  document_check: L(
    "Uploaded documents are being checked.",
    "अपलोड किए गए दस्तावेज़ जाँचे जा रहे हैं।",
  ),
  field_verification: L(
    "Sent to the tehsil office for field verification.",
    "क्षेत्र सत्यापन के लिए तहसील कार्यालय भेजा गया।",
  ),
  approved: L(
    "Certificate issued — download from the portal.",
    "प्रमाण पत्र जारी — पोर्टल से डाउनलोड करें।",
  ),
  rejected: L(
    "Rejected. Check the note and re-apply.",
    "अस्वीकृत। टिप्पणी देखकर फिर आवेदन करें।",
  ),
};

/**
 * Demo-only: pushes an application to its next status so judges can see the
 * timeline move. The real backend advances this itself.
 * ponytail: linear happy path only; add branch-to-rejected if the demo needs it.
 */
export async function advanceApplication(id: string) {
  write((d) => {
    const app = d.applications.find((a) => a.id === id);
    if (!app) return;
    const i = APP_FLOW.indexOf(app.status);
    if (i < 0 || i === APP_FLOW.length - 1) return;
    const next = APP_FLOW[i + 1];
    app.status = next;
    app.timeline.push({ status: next, at: nowIso(), note: APP_NOTES[next] });
  });
  return getApplication(id);
}

// --- Virtual queue ---------------------------------------------------------

function rollingAverage(q: Queue, tokens: Token[]) {
  const served = tokens.filter(
    (t) => t.queue_id === q.id && t.called_at && t.closed_at && t.status === "done",
  );
  if (served.length < 2) return q.baseline_service_minutes;
  const total = served.reduce(
    (sum, t) => sum + (Date.parse(t.closed_at!) - Date.parse(t.called_at!)) / 60000,
    0,
  );
  return Math.max(1, Math.round(total / served.length));
}

/** Builds the GET /queues/:queueId payload from raw rows. */
export function queueView(queueId: string): QueueView | null {
  const d = read();
  const queue = d.queues.find((q) => q.id === queueId);
  if (!queue) return null;
  const tokens = d.tokens
    .filter((t) => t.queue_id === queueId)
    .sort((a, b) => a.number - b.number);
  return {
    queue,
    tokens,
    now_serving: tokens.find((t) => t.status === "serving") ?? null,
    waiting: tokens.filter((t) => t.status === "waiting").length,
    avg_service_minutes: rollingAverage(queue, tokens),
  };
}

/** GET /queues/:queueId */
export async function getQueue(queueId: string) {
  return clone(queueView(queueId));
}

/** POST /queues/:queueId/join */
export async function joinQueue(
  queueId: string,
  holder: string,
): Promise<Token | null> {
  let created: Token | null = null;
  write((d) => {
    const q = d.queues.find((x) => x.id === queueId);
    if (!q) return;
    const token: Token = {
      id: newId("t"),
      queue_id: queueId,
      number: q.next_number,
      holder,
      status: "waiting",
      joined_at: nowIso(),
    };
    q.next_number += 1;
    d.tokens.push(token);
    d.my_token_ids.push(token.id);
    created = token;
  });
  return clone(created);
}

/** GET /tokens/:id */
export async function getToken(id: string) {
  return clone(read().tokens.find((t) => t.id === id) ?? null);
}

/** POST /queues/:queueId/next — closes whoever is serving, calls the lowest waiting token. */
export async function callNext(queueId: string) {
  write((d) => {
    const rows = d.tokens.filter((t) => t.queue_id === queueId);
    const serving = rows.find((t) => t.status === "serving");
    if (serving) {
      serving.status = "done";
      serving.closed_at = nowIso();
    }
    const next = rows
      .filter((t) => t.status === "waiting")
      .sort((a, b) => a.number - b.number)[0];
    if (next) {
      next.status = "serving";
      next.called_at = nowIso();
    }
  });
  return getQueue(queueId);
}

/** POST /tokens/:id/complete */
export async function completeToken(id: string) {
  write((d) => {
    const t = d.tokens.find((x) => x.id === id);
    if (!t) return;
    t.status = "done";
    t.closed_at = nowIso();
  });
  return getToken(id);
}

/** POST /tokens/:id/skip */
export async function skipToken(id: string) {
  write((d) => {
    const t = d.tokens.find((x) => x.id === id);
    if (!t) return;
    t.status = "skipped";
    t.closed_at = nowIso();
  });
  return getToken(id);
}

/** POST /queues/:queueId/reset — the demo-reset affordance. */
export async function resetQueue(queueId: string) {
  write((d) => {
    d.tokens = d.tokens.filter((t) => t.queue_id !== queueId);
    d.my_token_ids = d.my_token_ids.filter((id) =>
      d.tokens.some((t) => t.id === id),
    );
    const q = d.queues.find((x) => x.id === queueId);
    if (q) {
      q.next_number = 1;
      q.open = true;
    }
  });
  return getQueue(queueId);
}

/** Not in the contract — staff pause/resume is local counter state for the demo. */
export async function setQueueOpen(queueId: string, open: boolean) {
  write((d) => {
    const q = d.queues.find((x) => x.id === queueId);
    if (q) q.open = open;
  });
  return getQueue(queueId);
}

export async function getQueues() {
  return clone(read().queues);
}

// --- Admin ------------------------------------------------------------------

const DAY = 86400000;

/** Deterministic health checks derived from the spec itself. */
function runChecks(s: Service): HealthCheck[] {
  const checks: HealthCheck[] = [];
  const push = (
    id: string,
    level: CheckLevel,
    label: ReturnType<typeof L>,
    detail: ReturnType<typeof L>,
  ) => checks.push({ id, label, level, detail });

  push(
    "official_sources",
    s.official_sources.length ? "PASS" : "BLOCKER",
    L("Official sources cited", "आधिकारिक स्रोत उद्धृत"),
    s.official_sources.length
      ? L(
          `${s.official_sources.length} source(s) linked.`,
          `${s.official_sources.length} स्रोत जुड़े हैं।`,
        )
      : L(
          "No official source — cannot publish unsourced guidance.",
          "कोई आधिकारिक स्रोत नहीं — बिना स्रोत प्रकाशन संभव नहीं।",
        ),
  );

  const oldest = s.official_sources.reduce(
    (max, src) => Math.max(max, Date.now() - Date.parse(src.accessed_at)),
    0,
  );
  const days = Math.round(oldest / DAY);
  push(
    "source_freshness",
    days > 90 ? "BLOCKER" : days > 30 ? "WARN" : "PASS",
    L("Source freshness", "स्रोत की ताज़गी"),
    L(
      `Oldest source checked ${days} day(s) ago.`,
      `सबसे पुराना स्रोत ${days} दिन पहले जाँचा गया।`,
    ),
  );

  const missing = (["fee", "processing_time"] as const).filter((k) => !s[k]?.en);
  push(
    "core_fields",
    missing.length ? "BLOCKER" : "PASS",
    L("Fee and processing time present", "शुल्क और प्रक्रिया समय मौजूद"),
    missing.length
      ? L(`Missing: ${missing.join(", ")}.`, `अनुपलब्ध: ${missing.join(", ")}।`)
      : L("Both fields filled.", "दोनों फ़ील्ड भरे हैं।"),
  );

  push(
    "eligibility",
    s.eligibility.length ? "PASS" : "BLOCKER",
    L("Eligibility stated", "पात्रता बताई गई"),
    s.eligibility.length
      ? L(`${s.eligibility.length} criteria.`, `${s.eligibility.length} मानदंड।`)
      : L("No eligibility criteria.", "कोई पात्रता मानदंड नहीं।"),
  );

  const noVisual = s.steps.filter((st) => !st.visual).length;
  push(
    "step_visuals",
    !s.steps.length ? "BLOCKER" : noVisual ? "WARN" : "PASS",
    L("Every step has a visual", "प्रत्येक चरण में चित्र"),
    !s.steps.length
      ? L("No steps compiled.", "कोई चरण संकलित नहीं।")
      : noVisual
        ? L(`${noVisual} step(s) without a visual.`, `${noVisual} चरण बिना चित्र।`)
        : L(`All ${s.steps.length} steps illustrated.`, `सभी ${s.steps.length} चरण सचित्र।`),
  );

  const simulated = s.steps.filter((st) => st.visual?.type === "simulated").length;
  push(
    "visual_provenance",
    simulated ? "WARN" : "PASS",
    L("Screenshots are official", "स्क्रीनशॉट आधिकारिक हैं"),
    simulated
      ? L(
          `${simulated} simulated visual(s) — must stay labelled in the UI.`,
          `${simulated} नकली चित्र — UI में लेबल रहना चाहिए।`,
        )
      : L("All visuals are official screenshots.", "सभी चित्र आधिकारिक स्क्रीनशॉट हैं।"),
  );

  const untranslated = s.language_support.includes("hi")
    ? [s.name, s.fee, s.processing_time, ...s.steps.map((st) => st.instruction)].filter(
        (v) => !v?.hi,
      ).length
    : 0;
  push(
    "language_coverage",
    untranslated ? "WARN" : "PASS",
    L("Hindi translation complete", "हिंदी अनुवाद पूर्ण"),
    untranslated
      ? L(`${untranslated} field(s) English-only.`, `${untranslated} फ़ील्ड केवल अंग्रेज़ी में।`)
      : L("All key fields translated.", "सभी मुख्य फ़ील्ड अनूदित।"),
  );

  push(
    "requirements",
    s.requirements.some((r) => r.required) ? "PASS" : "WARN",
    L("Required documents listed", "आवश्यक दस्तावेज़ सूचीबद्ध"),
    L(
      `${s.requirements.length} document(s) listed.`,
      `${s.requirements.length} दस्तावेज़ सूचीबद्ध।`,
    ),
  );

  return checks;
}

function report(s: Service): VerificationReport {
  const checks = runChecks(s);
  const counts = { PASS: 0, WARN: 0, BLOCKER: 0 } as Record<CheckLevel, number>;
  checks.forEach((c) => (counts[c.level] += 1));
  return {
    id: newId("vr"),
    service_slug: s.slug,
    ran_at: nowIso(),
    verdict: counts.BLOCKER ? "BLOCKER" : counts.WARN ? "WARN" : "PASS",
    counts,
    checks,
  };
}

/**
 * POST /admin/services/compile — the real one scrapes official portals with an
 * LLM. Here: an existing spec comes back as a draft; an unknown service comes
 * back as a thin stub, which is what makes the health report show BLOCKERs.
 */
export async function compileService(input: {
  slug?: string;
  name: string;
  department: string;
}): Promise<Service> {
  const existing = input.slug
    ? SERVICES.find((s) => s.slug === input.slug)
    : undefined;
  const slug =
    input.slug ??
    input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const draft: Service = existing
    ? { ...clone(existing), published: false }
    : {
        slug,
        name: L(input.name),
        department: L(input.department || "Unassigned"),
        language_support: ["en", "hi"],
        eligibility: [],
        fee: L(""),
        processing_time: L(""),
        online_available: false,
        physical_visit_required: true,
        official_sources: [],
        requirements: [],
        steps: [],
        common_mistakes: [],
        faqs: [],
        verification: { status: "needs_review", last_checked: nowIso().slice(0, 10) },
        published: false,
      };
  draft.verification = {
    status: "needs_review",
    last_checked: nowIso().slice(0, 10),
  };
  write((d) => {
    d.drafts[draft.slug] = draft;
  });
  return clone(draft);
}

/** POST /admin/services/:id/verify */
export async function verifyService(
  slug: string,
): Promise<VerificationReport | null> {
  const s = read().drafts[slug] ?? SERVICES.find((x) => x.slug === slug);
  if (!s) return null;
  const r = report(s);
  write((d) => d.reports.unshift(r));
  return clone(r);
}

/** GET /admin/services/:id/verification-reports */
export async function getVerificationReports(slug: string) {
  return clone(read().reports.filter((r) => r.service_slug === slug));
}

/** POST /admin/services/:id/publish — gated on the latest report having no blockers. */
export async function publishService(slug: string) {
  const latest = read().reports.find((r) => r.service_slug === slug);
  if (!latest || latest.counts.BLOCKER > 0) {
    return { ok: false as const, reason: "blockers" as const, report: clone(latest) };
  }
  write((d) => {
    if (!d.published.includes(slug)) d.published.push(slug);
    const draft = d.drafts[slug];
    if (draft) draft.published = true;
  });
  return { ok: true as const, report: clone(latest) };
}

/** POST /admin/services/:id/flags */
export async function flagService(slug: string, note: string): Promise<Flag> {
  const flag: Flag = { id: newId("fl"), service_slug: slug, note, at: nowIso() };
  write((d) => d.flags.unshift(flag));
  return clone(flag);
}

export async function getDrafts() {
  return clone(read().drafts);
}

// --- Assistant, auth, dashboard --------------------------------------------

/**
 * POST /assistant/ask — the real one is RAG over the service spec. Mock: match
 * the question against the service's own FAQs and step tips, else hand off.
 */
export async function askAssistant(args: {
  slug?: string;
  step?: number;
  question: string;
}) {
  const s = args.slug ? await getService(args.slug) : null;
  const words = args.question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const hit = s?.faqs.find((f) =>
    words.some((w) => `${f.q.en} ${f.a.en}`.toLowerCase().includes(w)),
  );
  if (hit) return { answer: hit.a, source: "faq" as const };

  const step = s?.steps.find((st) => st.number === args.step);
  if (step?.tip) return { answer: step.tip, source: "step_tip" as const };
  if (step) return { answer: step.instruction, source: "step_instruction" as const };

  return {
    answer: L(
      "A volunteer will call you back on this step. Meanwhile, check the common mistakes list below.",
      "इस चरण के लिए एक स्वयंसेवक आपको कॉल करेगा। तब तक नीचे दी गई आम गलतियाँ देखें।",
    ),
    source: "fallback" as const,
  };
}

/** POST /auth/demo-login */
export async function demoLogin(name: string) {
  const user = { id: newId("u"), name };
  write((d) => (d.user = user));
  return user;
}

/** GET /users/:id/dashboard */
export async function getDashboard() {
  const d = read();
  const services = await getServices();
  const active =
    d.tokens.find(
      (t) =>
        d.my_token_ids.includes(t.id) &&
        (t.status === "waiting" || t.status === "serving"),
    ) ?? null;

  const relevant = new Set([
    ...d.saved,
    ...d.applications.map((a) => a.service_slug),
  ]);
  const pending_documents = services
    .filter((s) => relevant.has(s.slug))
    .flatMap((s) =>
      s.requirements
        .filter((r) => r.required && !(d.checked[s.slug] ?? []).includes(r.name.en))
        .map((r) => ({ service_slug: s.slug, service_name: s.name, requirement: r })),
    );

  return {
    user: d.user,
    active_token: clone(active),
    applications: clone(d.applications),
    saved_services: services.filter((s) => d.saved.includes(s.slug)),
    pending_documents,
  };
}

// --- Local UI state (no endpoint — stays client-side) ----------------------

export function toggleSaved(slug: string) {
  write((d) => {
    d.saved = d.saved.includes(slug)
      ? d.saved.filter((s) => s !== slug)
      : [...d.saved, slug];
  });
}

export function toggleChecked(slug: string, requirement: string) {
  write((d) => {
    const list = d.checked[slug] ?? [];
    d.checked[slug] = list.includes(requirement)
      ? list.filter((r) => r !== requirement)
      : [...list, requirement];
  });
}

/** Full demo reset — wipes queues, applications and admin state. */
export function resetDemo() {
  resetAll();
}
