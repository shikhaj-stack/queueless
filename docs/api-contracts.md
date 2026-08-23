# Queueless Bhopal — API Contract

Source of truth for the boundary between the frontend and the backend. Derived from
Section 6 of the *Backend Engineering Handoff*, with the Phase 0 decisions applied.

All routes are prefixed `/api`. All request and response bodies are JSON.

Everything in this document is **agreed and locked** unless Section 9 lists it as open.
Do not change it unilaterally — change it in a PR and tell the other teammate.

Status: Phase 0. No implementation exists yet. The Next.js application will be
scaffolded by the frontend teammate; the backend builds on top of that exact repo
state and does not create a parallel project.

---

## 1. Response envelope

Every endpoint returns one of exactly two shapes. HTTP status codes are meaningful and
always match the body.

Success:

```json
{ "data": {} }
```

Error:

```json
{
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

There is no `meta` key and no `details` key. Validation failures put the offending
field and reason into `message`.

Error codes in use:

| Code | HTTP | Meaning |
| --- | --- | --- |
| `VALIDATION_FAILED` | 400 | Zod rejected the request body or query |
| `UNAUTHENTICATED` | 401 | No demo session |
| `FORBIDDEN` | 403 | Session role is not allowed on this route |
| `NOT_FOUND` | 404 | No such service / queue / token / application |
| `CONFLICT` | 409 | Rule violation, e.g. user already holds an active token |
| `INVALID_TRANSITION` | 409 | Requested application status change is not allowed |
| `NOT_PUBLISHED` | 409 | Service exists but is not published |
| `UPSTREAM_FAILED` | 502 | Claude API or an external source failed |
| `INTERNAL` | 500 | Anything else |

## 2. Identity and roles

Demo identity only. Production authentication, OTP, email verification, and phone
authentication are out of scope for this project.

Roles: `citizen`, `staff`, `admin`.

Flow:

1. The browser calls `supabase.auth.signInAnonymously()` to obtain a real Supabase
   session. This gives every demo user a stable `auth.uid()`.
2. The browser calls `POST /api/auth/demo-login` with the desired role.
3. The server upserts a row in `public.users` with that id and role, and returns the
   user.
4. Every later request is authorised server-side by reading `public.users.role` for
   the current `auth.uid()`.

The role lives in the database, not in a JWT claim. That avoids a token-refresh round
trip and keeps a single source of truth. It costs one indexed lookup per guarded
request.

If anonymous sign-in turns out to be unavailable on the chosen Supabase plan or
configuration, the fallback is a signed, httpOnly demo-session cookie issued by
`POST /api/auth/demo-login` and verified server-side. The API contract does not change
in that case; only Realtime authorisation does, and the tables the frontend subscribes
to are readable by any session either way.

**Authorization is enforced on the server for every staff and admin route.** Frontend
role checks are presentation only; the backend never trusts them. A `citizen` session
calling a staff route receives `403 FORBIDDEN` regardless of what the UI shows.

Route access:

| Group | Required role |
| --- | --- |
| Service discovery, guides, departments, locations | any authenticated session |
| Applications create and read | `citizen` (own records only), `staff`, `admin` |
| Application status change | `staff` or `admin` |
| Dashboard | owner, or `staff` / `admin` |
| Queue join, own token read | any authenticated session |
| Queue next / complete / skip / reset | `staff` or `admin` |
| Discrepancy flags (create) | any authenticated session |
| Everything else under `/admin` | `admin` |

## 3. Resource addressing and language

- Citizen-facing service routes address a service by its **slug** (`domicile-certificate`).
- Admin service routes address a service by its **UUID**.
- The server resolver accepts either form on either route, so a mix-up is not fatal.
- Queues, tokens, applications, users, locations, departments are always UUIDs.

Language is selected by query parameter, never by header. Default is `en`.

```
GET /api/services/domicile-certificate?lang=hi
```

Supported values: `en`, `hi`. An unsupported value falls back to `en` rather than
erroring.

## 4. Pagination

No pagination in Phase 1. The demo contains 3–5 services. `GET /services` returns the
full list. This is revisited only if the dataset grows.

## 5. Simulated data labelling

The demo issues no real government references. Every synthetic record is labelled in
the response, per the handoff security rules.

- `applications.reference_number` is always prefixed `QLB-SIM-`.
- Any object containing simulated values carries `"simulated": true`. This includes
  every application, and every entry in an application status timeline.
- Service content carries `verification_status` and `last_verified_at` so the UI can
  distinguish source-backed official facts from Queueless-generated explanation.
- Fields generated by AI rather than taken from an official source are nested under an
  `explanation` object, never mixed into the official fields.

## 6. Endpoints

### 6.1 Service discovery and content

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/services` | any | List published services |
| GET | `/services/:slug` | any | Full service detail |
| POST | `/services/search` | any | AI service finder |
| GET | `/services/:slug/guide` | any | Ordered visual guide steps |
| GET | `/departments` | any | List departments |
| GET | `/locations?serviceId=&lat=&lng=` | any | Centres offering a service |

`GET /services` item shape:

```json
{
  "id": "uuid",
  "slug": "domicile-certificate",
  "name": "Domicile Certificate",
  "short_description": "...",
  "department": { "id": "uuid", "name": "Revenue Department" },
  "online_available": true,
  "physical_visit_required": true,
  "verification_status": "verified",
  "last_verified_at": "2026-08-01T00:00:00Z"
}
```

`GET /services/:slug` adds `eligibility`, `fee`, `processing_time`, `official_sources[]`,
`requirements[]`, `steps[]`, `common_mistakes[]`, `faqs[]`.

`POST /services/search` body `{ "query": string, "language": "en" | "hi" }`, returns
`{ "matches": [{ "service": <list item>, "confidence": 0.0-1.0, "reason": string }] }`.
Returns an empty `matches` array rather than guessing when nothing matches.

### 6.2 Locations and queue discovery

`GET /locations?serviceId=<uuid>` returns every centre offering that service, with the
queue embedded so the frontend can call join without a second round trip.

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Bhopal Tehsil Office",
      "address": "...",
      "lat": 23.2599,
      "lng": 77.4126,
      "distance_km": 3.4,
      "demo_status": "open",
      "queue": {
        "id": "uuid",
        "status": "open",
        "waiting_count": 3,
        "average_service_minutes": 8
      }
    }
  ]
}
```

`queue.id` is the `:queueId` used by `POST /api/queues/:queueId/join`.

`queue` is `null` when a location offers the service but has no queue configured.
`distance_km` is present only when both `lat` and `lng` are supplied.

### 6.3 Applications and status

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/applications` | citizen | Create a demo application |
| GET | `/applications/:id` | owner, staff, admin | Current status and full timeline |
| PATCH | `/applications/:id/status` | staff, admin | Advance application status |
| GET | `/users/:id/applications` | owner, staff, admin | All applications for a user |
| GET | `/users/:id/dashboard` | owner, staff, admin | Active token, applications, pending documents |

Applications do **not** advance automatically from queue events. Status changes are
explicit, staff- or admin-controlled, and always recorded.

`POST /applications` body `{ "service_id": "uuid" }`. Response:

```json
{
  "data": {
    "id": "uuid",
    "reference_number": "QLB-SIM-7F3A21",
    "status": "submitted",
    "simulated": true,
    "created_at": "..."
  }
}
```

Creating an application also writes the first `application_status_events` row with
status `submitted`.

`PATCH /applications/:id/status` body:

```json
{
  "status": "under_review",
  "note": "Application is being reviewed"
}
```

`note` is optional. The endpoint validates the transition server-side (Section 7),
writes an `application_status_events` row with the acting user's id, updates
`applications.status`, and returns the updated application including the timeline.
An illegal transition returns `409 INVALID_TRANSITION`.

`GET /applications/:id` returns both the current status and the ordered timeline:

```json
{
  "data": {
    "id": "uuid",
    "reference_number": "QLB-SIM-7F3A21",
    "service": { "id": "uuid", "slug": "domicile-certificate", "name": "Domicile Certificate" },
    "status": "under_review",
    "simulated": true,
    "created_at": "...",
    "updated_at": "...",
    "timeline": [
      {
        "id": "uuid",
        "status": "submitted",
        "note": null,
        "actor_id": null,
        "simulated": true,
        "created_at": "2026-08-20T10:00:00Z"
      },
      {
        "id": "uuid",
        "status": "under_review",
        "note": "Application is being reviewed",
        "actor_id": "uuid",
        "simulated": true,
        "created_at": "2026-08-21T09:15:00Z"
      }
    ]
  }
}
```

`timeline` is ordered oldest first and is never empty — creation always seeds it.

`GET /users/:id/dashboard` returns `active_token`, `applications`, and
`pending_documents`. It does **not** return `saved_services`; that feature has no table
and is out of scope for this phase.

### 6.4 Virtual queue

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/queues/:queueId/join` | citizen | Join, returns token |
| GET | `/queues/:queueId` | any | Queue state |
| GET | `/tokens/:id` | owner, staff, admin | Token status and position |
| POST | `/queues/:queueId/next` | staff, admin | Call next token |
| POST | `/tokens/:id/complete` | staff, admin | Complete, feeds rolling average |
| POST | `/tokens/:id/skip` | staff, admin | Skip or pause |
| POST | `/queues/:queueId/reset` | staff, admin | Clear tokens for a rehearsal run |

Token shape:

```json
{
  "id": "uuid",
  "queue_id": "uuid",
  "token_number": 14,
  "status": "waiting",
  "position": 3,
  "people_ahead": 2,
  "estimated_wait_minutes": 16,
  "approaching": false,
  "joined_at": "...",
  "called_at": null,
  "completed_at": null
}
```

Position semantics, stated explicitly so there is no off-by-one:

- `position` is **1-indexed**. `position: 1` means you are next to be called.
- `people_ahead` is always `position - 1`. Both are returned; use whichever reads
  better in the UI.
- Position is **derived**, never stored. It is the count of `waiting` tokens in the
  same queue with a lower `token_number`, plus one.

Token statuses: `waiting`, `called`, `in_service`, `completed`, `skipped`, `cancelled`.

`estimated_wait_minutes` is `people_ahead` multiplied by `queues.average_service_minutes`,
rounded.

`approaching` is `true` when `people_ahead` is 2 or fewer.

Queue shape from `GET /queues/:queueId`:

```json
{
  "id": "uuid",
  "location_id": "uuid",
  "service_id": "uuid",
  "status": "open",
  "current_token": 11,
  "last_issued_token": 14,
  "waiting_count": 3,
  "average_service_minutes": 8
}
```

Queue statuses: `open`, `paused`, `closed`.

A user may hold only one active token (`waiting` or `called`) per queue at a time.
Violating this returns `409 CONFLICT`. This is enforced by a database unique index,
not only by application code.

### 6.5 Realtime

The frontend subscribes directly to Supabase Realtime. This is the only place the
frontend touches Supabase without going through the API.

- Tables: `tokens` and `queue_events`.
- Both are `SELECT`-readable by any authenticated session. They contain no personal
  data — a queue board is public information by nature.
- All writes to both tables are server-only via the service role. The anon key cannot
  insert, update, or delete.
- On any change event the client recomputes position from the tokens it holds, or
  re-fetches `GET /tokens/:id`. The server does not push a computed position.

### 6.6 Admin and service engineering

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/admin/services/compile` | admin | Run the Service Compiler, return a draft spec |
| POST | `/admin/services/:id/verify` | admin | Run the Verification Agent, return a health report |
| GET | `/admin/services/:id/verification-reports` | admin | History of verification runs |
| POST | `/admin/services/:id/publish` | admin | Human-approved publish |
| POST | `/admin/services/:id/flags` | any authenticated | Log a citizen-reported discrepancy |
| GET | `/admin/services/:id/flags` | admin | List discrepancy flags for a service |

`compile` never publishes. `publish` refuses with `409` when the latest verification
report has an unresolved blocker.

Every admin mutation to a published service, and every application status change,
writes an `audit_log` row.

### 6.7 Assistant and auth

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/assistant/ask` | any | Contextual help |
| POST | `/auth/demo-login` | any | Set the demo role for the current session |

`POST /assistant/ask` body:

```json
{ "service_id": "uuid", "step_number": 3, "question": "..." }
```

`step_number` may be null. The assistant answers only from stored service data. When
the stored data does not contain the answer it says so rather than inventing a
government requirement.

`POST /auth/demo-login` body `{ "role": "citizen" | "staff" | "admin" }`. Returns
`{ "id", "role", "preferred_language" }`.

## 7. Application status transition model

Statuses:

| Status | Meaning |
| --- | --- |
| `submitted` | Created by the citizen. Always the initial state. |
| `under_review` | Staff has picked it up. |
| `processing` | Passed review, being acted on. |
| `approved` | Approved, outcome pending delivery. |
| `rejected` | Terminal. Declined. |
| `completed` | Terminal. Finished and delivered. |

Allowed transitions, enforced server-side. Anything not listed returns
`409 INVALID_TRANSITION`.

| From | Allowed next |
| --- | --- |
| `submitted` | `under_review`, `rejected` |
| `under_review` | `processing`, `approved`, `rejected` |
| `processing` | `approved`, `rejected`, `completed` |
| `approved` | `completed` |
| `rejected` | none (terminal) |
| `completed` | none (terminal) |

Rules:

- A transition to the status the application is already in is rejected, not silently
  accepted.
- Only `staff` and `admin` may change status. A citizen calling `PATCH` gets `403`.
- Every accepted transition writes one `application_status_events` row. The timeline is
  append-only; rows are never updated or deleted.
- The timeline is read from `application_status_events`, not derived from
  `applications.updated_at`. `updated_at` remains as a cheap freshness marker only.
- Every timeline entry is labelled `"simulated": true` for the duration of the demo.
- Every transition also writes an `audit_log` row recording actor, before, and after.

## 8. Schema deviations from the handoff

Four changes to Handoff Section 4. Flagged here because the handoff requires telling
the frontend teammate before changing the schema.

1. **`application_status_events` added.** New table backing the persistent status
   timeline. The handoff's definition of done requires a timeline but its schema had no
   table to hold one. Fields: `id`, `application_id`, `status`, `note`, `actor_id`,
   `created_at`.
2. **`queues.last_issued_token` added.** `current_token` is the number being served;
   `last_issued_token` is the highest number handed out. One column cannot be both.
3. **`tokens.position` dropped.** Position is derived on read. Storing it means
   rewriting every waiting row on each dequeue and racing under concurrent joins. The
   API response still contains `position`, so the contract is unaffected.
4. **Partial unique index on `tokens (queue_id, user_id)`** for active statuses,
   enforcing the one-active-token rule at the database level rather than in
   application code where it has a time-of-check/time-of-use hole.

Also note: the handoff's suggested application status `additional_documents_required`
is not in the agreed status list. `processing` and `completed` were added. If the
frontend needs a "documents required" state, raise it before Phase 4.

## 9. Scope decisions

Implemented from Handoff Section 11 optional features:

- Discrepancy flags (`service_flags`)
- Audit log (`audit_log`)

Explicitly **not** implemented in this phase:

- Notifications / SMS / WhatsApp
- QR check-in
- Combo queue
- Queue analytics endpoint
- `saved_services`
- Pagination

These are revisited only if Phases 1–6 finish early.

## 10. Open items

Nothing in this contract is open. The one thing still unresolved is outside the
contract: the Next.js application does not exist in the repository yet. The frontend
teammate owns that scaffold. Backend implementation starts from that pushed state.
