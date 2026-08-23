# Supabase Setup — Queueless Bhopal

Steps to create and connect the Supabase project. Both teammates work against **one**
Supabase project, never two.

No secret values appear in this repository. Real keys go only in `.env.local`, which is
git-ignored.

---

## 1. Create the project

1. Sign in at <https://supabase.com/dashboard>.
2. **New project**.
   - Name: `queueless-bhopal`
   - Region: choose the one closest to Bhopal — `ap-south-1` (Mumbai).
   - Database password: generate a strong one and store it in a password manager. It is
     needed for CLI migrations and cannot be recovered later, only reset.
3. Wait for provisioning to finish.

Free tier is sufficient for this demo. Note that free projects pause after a week of
inactivity — open the dashboard the day before the demo so it is warm.

## 2. Collect the values

Dashboard → **Project Settings → API**:

| Dashboard label | Environment variable |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Project API keys → `anon` / `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Project API keys → `service_role` / `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

The `service_role` key bypasses row level security entirely. It is server-only. Never
give it a `NEXT_PUBLIC_` prefix, never import it into a client component, never paste it
into a chat or an issue.

The Claude API key comes from <https://console.anthropic.com> → API Keys, and goes into
`ANTHROPIC_API_KEY`.

## 3. Local environment

```bash
cp .env.example .env.local
```

Fill in the four values. `.env.local` is covered by `.gitignore` and must never be
committed.

`.env.example` contains only these keys, with empty values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## 4. Enable anonymous sign-ins

Dashboard → **Authentication → Sign In / Providers → Anonymous Sign-Ins** → enable.

This is **off by default**. The demo identity flow does not work without it.

No other provider is enabled. Email, phone, OTP, and social login are out of scope for
this project.

Also under **Authentication → Rate Limits**, raise the anonymous sign-in limit if a live
demo will create many sessions from one IP. The default is low enough to bite during a
rehearsal with several devices on the same network.

If anonymous sign-ins turn out to be unavailable, the fallback is a signed httpOnly
demo-session cookie issued by `POST /api/auth/demo-login`. The API contract is unchanged
in that case; see `api-contracts.md` Section 2.

## 5. Vercel environment variables

Dashboard → project → **Settings → Environment Variables**. Add the same four keys for
Preview and Production.

`SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` must not be exposed to the browser —
do not rename them with a `NEXT_PUBLIC_` prefix.

## 6. CLI, for migrations

Needed only by whoever applies migrations. Installed in Phase 1, listed here so the
setup is in one place.

```bash
npm install --save-dev supabase
npx supabase login
npx supabase link --project-ref <project-ref>
```

`<project-ref>` is the subdomain in the project URL: `https://<project-ref>.supabase.co`.
It is not a secret.

Applying migrations, and regenerating types after a schema change:

```bash
npx supabase db push
npx supabase gen types typescript --linked > lib/db/types.ts
```

## 7. Realtime

Migration `011_realtime.sql` adds `tokens` and `queue_events` to the
`supabase_realtime` publication. Nothing to click in the dashboard — it is applied with
the rest of the schema.

Confirm afterwards under **Database → Replication** that both tables are listed.

## 8. Row level security

Applied by migration `010_rls.sql`, not by hand. Intended end state:

| Table | anon / authenticated | service role |
| --- | --- | --- |
| `tokens` | `SELECT` only | full |
| `queue_events` | `SELECT` only | full |
| every other table | no access | full |

RLS is enabled on every table in `public`. The frontend reaches everything except
Realtime through the API, using the anon key, which has no direct read path to service
or application data.

`tokens` and `queue_events` are readable because a queue board is public information by
nature — they hold token numbers, statuses, and opaque user UUIDs, no personal data.

## 9. Verification checklist

Before Phase 1 is considered connected:

- [ ] Project created in `ap-south-1`
- [ ] Database password stored safely
- [ ] Anonymous sign-ins enabled
- [ ] `.env.local` filled in locally, not committed
- [ ] `git status` shows no `.env.local`
- [ ] Same project URL shared with the frontend teammate — one project, not two
- [ ] Vercel environment variables set for Preview and Production
- [ ] `npx supabase link` succeeds

## 10. Rules

- One Supabase project for both teammates. Separate projects mean divergent schemas and
  a broken demo.
- Never commit `.env.local` or any real key.
- Schema changes are made by migration files in `supabase/migrations`, never by editing
  tables in the dashboard. Dashboard edits are invisible to the other teammate and are
  lost on a fresh apply.
- Regenerate `lib/db/types.ts` after every schema change and commit it.
- Any schema change is also reflected in `api-contracts.md` and `architecture.md` before
  the pull request is merged.
