# ExamReady A1

A mobile-first German A1 readiness check for Goethe-Zertifikat A1 and ÖSD Zertifikat A1 learners. The app serves 15 questions (5 vocabulary, 5 grammar, 5 reading), grades them on the server, reports a readiness verdict and practice priorities, supports full answer review with rule explanations, and prioritizes unseen items on retakes.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js + Express (`server.ts`)
- **Storage:** Neon PostgreSQL over HTTPS SQL (`DATABASE_URL`) with automatic schema creation & seeding, plus zero-config local JSON persistence (`.data/store.json`) when `DATABASE_URL` is not configured
- **Guest Sessions:** HMAC-SHA256 signed HTTP-only session cookies (`examready_sid`) with `X-ExamReady-Session` fallback for cross-site preview iframes

## 1. Requirements

- Node.js 20+
- Optional: A Neon PostgreSQL connection string (when omitted, the server persists guest attempts locally in `.data/store.json`)

## 2. Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```env
# Neon PostgreSQL
DATABASE_URL="your-neon-database-url"

# Better Auth
BETTER_AUTH_SECRET="your-generated-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- Generate a strong secret with `openssl rand -hex 32` (or `npx auth@latest secret`).
- Keep `DATABASE_URL` and `BETTER_AUTH_SECRET` strictly server-side; neither is exposed to the browser.
- When `DATABASE_URL` is set to a valid `postgresql://` Neon URL, the server automatically creates the `"user"`, `passages`, `questions`, `attempts`, and `attempt_answers` tables and seeds the 4 reading passages and 45 questions on first request.

## 3. Install and Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4. Build and Start for Production

```bash
npm run build
npm start
```

`npm run build` bundles the Vite client into `dist/` and compiles `server.ts` into `server.js` via `esbuild`. `npm start` serves both the API and static frontend on `process.env.PORT || 3000`.

## 5. Deploy to Render or Vercel

### Option A: Deploy on Render (Node Web Service)
1. Push your repository to GitHub.
2. In Render, click **New + -> Web Service** and connect the repository.
3. Configure the service:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=<your-neon-postgres-connection-string>`
   - `BETTER_AUTH_SECRET=<32+-char-random-secret>`
   - `BETTER_AUTH_URL=https://<your-service>.onrender.com`
   - `NEXT_PUBLIC_SITE_URL=https://<your-service>.onrender.com`
5. Deploy. Note: Use Neon `DATABASE_URL` on Render's free tier because Render's local filesystem resets on redeploys/restarts.

### Option B: Deploy on Vercel (Static Frontend + Serverless API)
1. Push your repository to GitHub.
2. Import the project in Vercel (`vercel.json` and `api/index.ts` are already configured).
3. Add Environment Variables in **Project Settings -> Environment Variables**:
   - `DATABASE_URL=<your-neon-postgres-connection-string>` (required on Vercel since serverless functions have an ephemeral filesystem)
   - `BETTER_AUTH_SECRET=<32+-char-random-secret>`
   - `BETTER_AUTH_URL=https://<your-app>.vercel.app`
   - `NEXT_PUBLIC_SITE_URL=https://<your-app>.vercel.app`
4. Deploy. Vercel runs `npm run build`, serves `dist/`, routes `/api/*` to `api/index.ts`, and rewrites SPA routes (`/check`, `/results/:id`, `/review/:id`, `/about`) to `index.html`.

## Readiness Calculation

Each question carries a difficulty weight of **1** (Easy), **2** (Medium), or **3** (Hard).

- **Skill score:** `round((weighted points earned / weighted points available) * 100)`
- **Overall score:** `round(Vocabulary * 0.30 + Grammar * 0.30 + Reading * 0.40)`

Verdict rules:

- **Ready to book:** Overall score `>= 75%` **and** every individual skill `>= 60%`
- **Almost there:** Overall score `>= 60%`, but the Ready rule is not met
- **Not yet:** Overall score `< 60%`

This is a short readiness estimate focused on Vocabulary, Grammar, and Reading — not an official Goethe or ÖSD result. Results always remind learners to practise Listening (*Hören*) and Speaking (*Sprechen*) as well.

## Architecture & Security

- **No-signup guest sessions:** `resolveGuestSession` verifies the signed `examready_sid` HTTP-only cookie (with `SameSite=None; Secure; Partitioned` on HTTPS and `X-ExamReady-Session` header fallback when cross-site iframe cookies are restricted).
- **Answer keys kept server-side:** `POST /api/attempts` returns only public question fields (`id`, `orderIndex`, `skill`, `difficulty`, `topic`, `prompt`, `options`, and `passage`). `correctIndex` and `explanation` are withheld until `GET /api/attempts/:id/review` after submission.
- **Server-side grading & ownership checks:** `POST /api/attempts/:id/submit` verifies attempt ownership (`attemptId` + `userId`), grades all 15 answers on the server using `computeReadiness`, and persists the summary and per-question results.
- **Fresh retakes:** Question selection prioritizes questions and passages unseen in the learner's two most recent attempts.

## Routes

### Frontend Pages
- `/` — Landing page, assessment structure, sample preview, and guest check history
- `/check` — 15-question assessment with 2-column reading split on desktop and thumb bar on mobile
- `/results/:attemptId` — Readiness verdict, weighted skill breakdown, and ranked practice priorities
- `/review/:attemptId` — Filterable answer review with rule explanations and passage references
- `/about` — Scoring formula, difficulty weights, and exam scope

### API Endpoints
- `GET /api/health` — Server health check
- `GET /api/auth/session` (and `/api/auth/get-session`) — Resolve or initialize guest session and return attempt history
- `POST /api/auth/guest` (and `/api/auth/sign-in/anonymous`) — Initialize guest session
- `POST /api/attempts` — Create a 15-question attempt and return public questions
- `GET /api/attempts` — List the current guest learner's attempts
- `GET /api/attempts/:id` — Retrieve an in-progress attempt or completed summary
- `POST /api/attempts/:id/submit` — Grade all 15 answers on the server and persist results
- `GET /api/attempts/:id/review` — Return completed answer review with `correctIndex` and `explanation`

## Project Structure

```text
server.ts                 # Express server, guest session middleware, API routes, Vite/static serving
server/
  neon.ts                 # Neon PostgreSQL HTTP SQL adapter, schema creation, and seeding
  store.ts                # Session signing, fresh-question selection, persistence, and grading store
data/seed/
  passages.ts             # 4 authentic German A1 reading passages
  questions.ts            # 45 A1 questions (15 vocabulary, 15 grammar, 15 reading)
shared/
  types.ts                # Shared TypeScript interfaces
  scoring.ts              # Pure weighted scoring, verdict, and priority engine
src/
  App.tsx                 # App shell and route wiring
  components/             # Navbar, Footer, VerdictDisplay
  lib/                    # History API router and typed API client
  pages/                  # LandingPage, CheckPage, ResultsPage, ReviewPage, AboutPage
```

## Typecheck

```bash
npm run lint
```
