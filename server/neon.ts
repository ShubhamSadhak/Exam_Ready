import { PASSAGES } from '../data/seed/passages.ts';
import { QUESTIONS } from '../data/seed/questions.ts';

export function getConfiguredDatabaseUrl(): string | null {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw || raw === 'your-neon-database-url' || raw === 'MY_DATABASE_URL') {
    return null;
  }
  if (!raw.startsWith('postgres://') && !raw.startsWith('postgresql://')) {
    return null;
  }
  return raw;
}

interface NeonQueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

export async function queryNeon<T = Record<string, unknown>>(
  databaseUrl: string,
  sql: string,
  params: unknown[] = []
): Promise<NeonQueryResult<T>> {
  const parsed = new URL(databaseUrl);
  const endpoint = `https://${parsed.hostname}/sql`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': databaseUrl,
    },
    body: JSON.stringify({ query: sql, params }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Neon SQL HTTP error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    rows?: T[];
    rowCount?: number;
  };

  return {
    rows: Array.isArray(data.rows) ? data.rows : [],
    rowCount: typeof data.rowCount === 'number' ? data.rowCount : 0,
  };
}

let schemaInitializedForUrl: string | null = null;

export async function ensureNeonSchemaAndSeed(databaseUrl: string): Promise<void> {
  if (schemaInitializedForUrl === databaseUrl) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Guest Learner',
      email TEXT,
      "passwordHash" TEXT,
      "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT`,
    `CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique_idx ON "user" (LOWER(email)) WHERE email IS NOT NULL`,
    `CREATE TABLE IF NOT EXISTS passages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      context TEXT NOT NULL,
      body TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      skill TEXT NOT NULL,
      difficulty INTEGER NOT NULL,
      topic TEXT NOT NULL,
      prompt TEXT NOT NULL,
      options JSONB NOT NULL,
      "correctIndex" INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      "passageId" TEXT REFERENCES passages(id)
    )`,
    `CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "user"(id),
      status TEXT NOT NULL,
      "questionIds" JSONB NOT NULL,
      summary JSONB,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "completedAt" TIMESTAMPTZ
    )`,
    `CREATE TABLE IF NOT EXISTS attempt_answers (
      id TEXT PRIMARY KEY,
      "attemptId" TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
      "questionId" TEXT NOT NULL REFERENCES questions(id),
      "selectedIndex" INTEGER NOT NULL,
      "correctIndex" INTEGER NOT NULL,
      "isCorrect" BOOLEAN NOT NULL
    )`,
  ];

  for (const stmt of statements) {
    await queryNeon(databaseUrl, stmt);
  }

  for (const p of PASSAGES) {
    await queryNeon(
      databaseUrl,
      `INSERT INTO passages (id, title, context, body)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, context = EXCLUDED.context, body = EXCLUDED.body`,
      [p.id, p.title, p.context, p.body]
    );
  }

  for (const q of QUESTIONS) {
    await queryNeon(
      databaseUrl,
      `INSERT INTO questions (id, skill, difficulty, topic, prompt, options, "correctIndex", explanation, "passageId")
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         skill = EXCLUDED.skill,
         difficulty = EXCLUDED.difficulty,
         topic = EXCLUDED.topic,
         prompt = EXCLUDED.prompt,
         options = EXCLUDED.options,
         "correctIndex" = EXCLUDED."correctIndex",
         explanation = EXCLUDED.explanation,
         "passageId" = EXCLUDED."passageId"`,
      [
        q.id,
        q.skill,
        q.difficulty,
        q.topic,
        q.prompt,
        JSON.stringify(q.options),
        q.correctIndex,
        q.explanation,
        q.passageId ?? null,
      ]
    );
  }

  schemaInitializedForUrl = databaseUrl;
}
