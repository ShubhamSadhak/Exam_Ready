# ExamReady A1

A mobile-first German A1 readiness check for Goethe / ÖSD learners. The app serves 15 questions (5 vocabulary, 5 grammar, 5 reading), grades them on the server, reports a readiness verdict and practice priorities, supports answer review, and allows fresh-question retakes.

## Stack

- **Next.js 14 App Router**, React 18, TypeScript, Tailwind CSS
- **Neon PostgreSQL** for managed relational storage
- **Prisma ORM 6** for schema, migrations, queries and seeding
- **Better Auth** with its anonymous plugin for no-signup guest sessions
- **Vercel** for application hosting

## 1. Requirements

- Node.js 20+
- A Neon project and PostgreSQL connection string
- A Better Auth secret

## 2. Environment setup

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
BETTER_AUTH_SECRET="a-long-random-secret-at-least-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Use Neon's **pooled** connection string for serverless deployments where appropriate. Keep the database URL and Better Auth secret server-side; neither should use a `NEXT_PUBLIC_` prefix.

Generate a secret with:

```bash
npx auth@latest secret
```

## 3. Install and initialize

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

The Prisma migration creates Better Auth's `user`, `session`, `account`, and `verification` tables plus the app's `passages`, `questions`, `attempts`, and `attempt_answers` tables. The seed script loads the four German reading passages and the 45-question bank from `data/seed/`.

For a fresh database, `prisma/migrations/0001_init/migration.sql` is the checked-in baseline. `prisma migrate deploy` applies committed migrations in production.

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## 5. Deploy

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `NEXT_PUBLIC_SITE_URL` to Vercel environment variables. Set both URLs to the production origin.
4. Set the build command to `npm run build` (it runs `prisma generate` before `next build`).
5. Apply migrations against the production Neon database with `npx prisma migrate deploy`.
6. Seed the production question bank once with `npm run db:seed`.
7. Redeploy and test the full flow on a phone.

## Readiness calculation

Each question has a difficulty weight of 1 (easy), 2 (medium), or 3 (hard). Skill score is weighted points earned divided by weighted points available. Overall score is Vocabulary 30% + Grammar 30% + Reading 40%.

- **Ready to book:** overall score >= 75 and every skill >= 60.
- **Almost there:** overall score >= 60 but the Ready rule is not met.
- **Not yet:** overall score < 60.

This is a short readiness estimate, not an official Goethe or ÖSD result. Results always remind learners to practise listening and speaking too.

## Architecture and security

- Better Auth anonymous sign-in creates a guest user and an HTTP-only session cookie. Browser requests to same-origin API routes automatically send the cookie; no bearer token is stored in application code.
- `getCurrentUser()` resolves the session on the server for every attempt/result/review API request.
- Prisma is used only from server-side code. The browser never connects directly to Neon.
- Question selection returns only public question fields. `correctIndex` and `explanation` are not returned until the completed attempt's review endpoint.
- Grading runs in the submit route and writes answers plus scores in a database transaction.
- Attempts are always queried with both attempt ID and authenticated user ID.
- There is no Supabase dependency, Supabase client, RLS policy, or Supabase migration in this version. Access control is enforced by the server routes and Prisma query filters.

## Routes

- `/` — landing page
- `/check` — 15-question assessment
- `/results/[attemptId]` — readiness verdict and priorities
- `/review/[attemptId]` — correct answers and explanations
- `/about` — scoring explanation
- `POST /api/attempts` — create attempt and return public questions
- `POST /api/attempts/[id]/submit` — server-side grading and persistence
- `GET /api/attempts/[id]` — result summary
- `GET /api/attempts/[id]/review` — completed answer review
- `/api/auth/[...all]` — Better Auth endpoints

## Project structure

```text
app/                         # pages and API routes
components/                  # reusable UI components
lib/auth/auth.ts             # Better Auth server configuration
lib/auth/auth-client.ts      # Better Auth browser client
lib/auth/session.ts          # server-side session helper
lib/prisma.ts                # singleton Prisma client
lib/scoring.ts               # pure scoring and priority functions
lib/types.ts                 # application types
prisma/schema.prisma         # auth + app database models
prisma/migrations/           # versioned PostgreSQL migrations
prisma/seed.ts                # seed runner
 data/seed/                   # four passages and 45 questions
```

## Tests

```bash
npm test
npx prisma validate
npx tsc --noEmit
```

The browser session is stored in an HTTP-only cookie managed by Better Auth. If a guest clears site data, their guest session and access to that attempt may be lost. Account linking can be added later when email/Google sign-in is introduced.
