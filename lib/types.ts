// Shapes mirror the agreed API contract. Localized strings are `LText` so no
// shared component ever hardcodes English.

export type Lang = "en" | "hi";

/** A string in every language the service supports. `hi` optional = falls back to `en`. */
export type LText = { en: string; hi?: string };

export const L = (en: string, hi?: string): LText => ({ en, hi });

export type OfficialSource = { url: string; title: string; accessed_at: string };

export type Requirement = {
  name: LText;
  required: boolean;
  explanation: LText;
};

export type Visual = {
  type: "official_screenshot" | "simulated";
  asset: string;
  /** Overlay box in % of the image, drawn with an arrow + label. */
  highlight?: { label: LText; box: [x: number, y: number, w: number, h: number] };
};

export type Step = {
  number: number;
  title: LText;
  instruction: LText;
  tip?: LText;
  visual?: Visual;
};

export type Faq = { q: LText; a: LText };

export type VerificationStatus = "verified" | "needs_review" | "stale";

export type Service = {
  slug: string;
  name: LText;
  department: LText;
  language_support: Lang[];
  eligibility: LText[];
  fee: LText;
  processing_time: LText;
  online_available: boolean;
  physical_visit_required: boolean;
  official_sources: OfficialSource[];
  requirements: Requirement[];
  steps: Step[];
  common_mistakes: LText[];
  faqs: Faq[];
  verification: { status: VerificationStatus; last_checked: string };
  /** UI-only helpers, not part of the spec contract. */
  queue_id?: string;
  popular?: boolean;
  published?: boolean;
};

export type Location = {
  id: string;
  name: LText;
  address: LText;
  service_slugs: string[];
};

// --- Tutorials & Form Walkthroughs ------------------------------------------

export type FormFieldHotspot = {
  id: string;
  field_name: LText;
  badge_number: number;
  position: { x: number; y: number; w: number; h: number };
  sample_value: string;
  what_to_enter: LText;
  pro_tip?: LText;
  common_mistake?: LText;
  required: boolean;
  input_type?: "text" | "number" | "date" | "select" | "file";
  options?: LText[];
};

export type TutorialStep = {
  step_number: number;
  title: LText;
  description: LText;
  screenshot_type: "official_screenshot" | "simulated";
  screenshot_asset: string;
  hotspots: FormFieldHotspot[];
  checklist?: LText[];
};

export type FormTutorial = {
  id: string;
  service_slug: string;
  title: LText;
  category: LText;
  difficulty: "easy" | "medium" | "hard";
  estimated_time: LText;
  portal_name: LText;
  portal_url: string;
  summary: LText;
  prerequisites: LText[];
  steps: TutorialStep[];
  common_rejections: { reason: LText; prevention: LText }[];
};

// --- Applications -----------------------------------------------------------

export type AppStatus =
  | "submitted"
  | "document_check"
  | "field_verification"
  | "approved"
  | "rejected";

export const APP_FLOW: AppStatus[] = [
  "submitted",
  "document_check",
  "field_verification",
  "approved",
];

export type Application = {
  id: string;
  /** Always simulated in the demo — the UI must say so. */
  reference_no: string;
  service_slug: string;
  applicant_name: string;
  status: AppStatus;
  created_at: string;
  timeline: { status: AppStatus; at: string; note?: LText }[];
};

// --- Virtual queue ----------------------------------------------------------

export type TokenStatus = "waiting" | "serving" | "done" | "skipped";

export type Token = {
  id: string;
  queue_id: string;
  number: number;
  holder: string;
  status: TokenStatus;
  joined_at: string;
  called_at?: string;
  closed_at?: string;
};

export type Queue = {
  id: string;
  service_slug: string;
  location_id: string;
  open: boolean;
  next_number: number;
  /** Seed used until enough tokens are completed to compute a rolling average. */
  baseline_service_minutes: number;
};

/** Shape returned by GET /queues/:queueId */
export type QueueView = {
  queue: Queue;
  tokens: Token[];
  now_serving: Token | null;
  waiting: number;
  avg_service_minutes: number;
};

// --- Admin ------------------------------------------------------------------

export type CheckLevel = "PASS" | "WARN" | "BLOCKER";

export type HealthCheck = {
  id: string;
  label: LText;
  level: CheckLevel;
  detail: LText;
};

export type VerificationReport = {
  id: string;
  service_slug: string;
  ran_at: string;
  verdict: CheckLevel;
  counts: Record<CheckLevel, number>;
  checks: HealthCheck[];
};

export type Flag = { id: string; service_slug: string; note: string; at: string };
