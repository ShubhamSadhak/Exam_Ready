import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { PASSAGES } from '../data/seed/passages.ts';
import { QUESTIONS } from '../data/seed/questions.ts';
import { computeReadiness } from '../shared/scoring.ts';
import type {
  AttemptHistoryItem,
  AttemptResultSummary,
  AttemptReviewResponse,
  AuthUser,
  Difficulty,
  Passage,
  PublicQuestion,
  QuestionRecord,
  ReviewQuestionItem,
  Skill,
} from '../shared/types.ts';
import {
  ensureNeonSchemaAndSeed,
  getConfiguredDatabaseUrl,
  queryNeon,
} from './neon.ts';

export interface StoredUser {
  id: string;
  name: string;
  email: string | null;
  passwordHash: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

export function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name || 'Guest Learner',
    email: user.email ?? null,
    isAnonymous: Boolean(user.isAnonymous),
  };
}

export interface StoredAttemptAnswer {
  questionId: string;
  selectedIndex: number;
  correctIndex: 0 | 1 | 2 | 3;
  isCorrect: boolean;
}

export interface StoredAttempt {
  id: string;
  userId: string;
  status: 'in_progress' | 'completed';
  questionIds: string[];
  createdAt: string;
  completedAt: string | null;
  answers: StoredAttemptAnswer[];
  summary: AttemptResultSummary | null;
}

interface StoreData {
  users: Record<string, StoredUser>;
  attempts: Record<string, StoredAttempt>;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const SECRET_PATH = path.join(DATA_DIR, '.session-secret');

const PASSAGE_MAP = new Map<string, Passage>(PASSAGES.map((p) => [p.id, p]));
const QUESTION_MAP = new Map<string, QuestionRecord>(QUESTIONS.map((q) => [q.id, q]));

let cachedStore: StoreData | null = null;
let cachedSecret: string | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getSessionSecret(): Promise<string> {
  if (cachedSecret) return cachedSecret;

  const betterAuthSecret = process.env.BETTER_AUTH_SECRET?.trim();
  if (
    betterAuthSecret &&
    betterAuthSecret !== 'your-generated-secret' &&
    betterAuthSecret.length >= 16
  ) {
    cachedSecret = betterAuthSecret;
    return cachedSecret;
  }

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    cachedSecret = process.env.SESSION_SECRET;
    return cachedSecret;
  }

  await ensureDataDir();
  try {
    const existing = (await fs.readFile(SECRET_PATH, 'utf8')).trim();
    if (existing.length >= 32) {
      cachedSecret = existing;
      return cachedSecret;
    }
  } catch {
    // Generate a fresh secret below
  }
  const generated = crypto.randomBytes(32).toString('hex');
  await fs.writeFile(SECRET_PATH, generated, 'utf8');
  cachedSecret = generated;
  return cachedSecret;
}

async function loadStore(): Promise<StoreData> {
  if (cachedStore) return cachedStore;
  await ensureDataDir();
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as StoreData;
    cachedStore = {
      users: parsed.users ?? {},
      attempts: parsed.attempts ?? {},
    };
  } catch {
    cachedStore = { users: {}, attempts: {} };
    await persistStore(cachedStore);
  }
  return cachedStore;
}

function persistStore(store: StoreData): Promise<void> {
  const snapshot = JSON.stringify(store, null, 2);
  writeChain = writeChain.then(async () => {
    await ensureDataDir();
    const tmpPath = `${STORE_PATH}.tmp`;
    await fs.writeFile(tmpPath, snapshot, 'utf8');
    await fs.rename(tmpPath, STORE_PATH);
  });
  return writeChain;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function normalizeEmail(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signSessionToken(userId: string): Promise<string> {
  const secret = await getSessionSecret();
  const sig = crypto.createHmac('sha256', secret).update(userId).digest('hex');
  return `${userId}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [userId, sig] = parts;
  if (!userId || !sig) return null;
  const secret = await getSessionSecret();
  const expected = crypto.createHmac('sha256', secret).update(userId).digest('hex');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  return userId;
}

function normalizeStoredUser(raw: Partial<StoredUser> & { id: string }): StoredUser {
  return {
    id: raw.id,
    name: raw.name || 'Guest Learner',
    email: raw.email ?? null,
    passwordHash: raw.passwordHash ?? null,
    isAnonymous: raw.isAnonymous ?? !raw.email,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export async function ensureGuestUser(existingUserId: string | null): Promise<StoredUser> {
  const dbUrl = getConfiguredDatabaseUrl();
  if (dbUrl) {
    await ensureNeonSchemaAndSeed(dbUrl);
    if (existingUserId) {
      const existing = await queryNeon<{
        id: string;
        name: string;
        email: string | null;
        passwordHash: string | null;
        isAnonymous: boolean;
        createdAt: string;
      }>(
        dbUrl,
        `SELECT id, name, email, "passwordHash", "isAnonymous", "createdAt" FROM "user" WHERE id = $1 LIMIT 1`,
        [existingUserId]
      );
      if (existing.rows[0]) {
        const row = existing.rows[0];
        return {
          id: row.id,
          name: row.name || 'Guest Learner',
          email: row.email ?? null,
          passwordHash: row.passwordHash ?? null,
          isAnonymous: Boolean(row.isAnonymous),
          createdAt: new Date(row.createdAt).toISOString(),
        };
      }
    }
    const newId = `guest_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    await queryNeon(
      dbUrl,
      `INSERT INTO "user" (id, name, "isAnonymous", "createdAt", "updatedAt") VALUES ($1, $2, true, $3, $3)`,
      [newId, 'Guest Learner', now]
    );
    return {
      id: newId,
      name: 'Guest Learner',
      email: null,
      passwordHash: null,
      isAnonymous: true,
      createdAt: now,
    };
  }

  const store = await loadStore();
  if (existingUserId && store.users[existingUserId]) {
    const normalized = normalizeStoredUser(store.users[existingUserId]);
    store.users[existingUserId] = normalized;
    return normalized;
  }
  const user: StoredUser = {
    id: `guest_${crypto.randomUUID()}`,
    name: 'Guest Learner',
    email: null,
    passwordHash: null,
    isAnonymous: true,
    createdAt: new Date().toISOString(),
  };
  store.users[user.id] = user;
  await persistStore(store);
  return user;
}

export async function createFreshGuestUser(): Promise<StoredUser> {
  return ensureGuestUser(null);
}

export async function signUpUser(
  currentUserId: string | null,
  input: { name?: unknown; email?: unknown; password?: unknown }
): Promise<StoredUser> {
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = normalizeEmail(input.email);
  const password = typeof input.password === 'string' ? input.password : '';

  if (name.length < 2) {
    throw new Error('VALIDATION:Please enter your name (at least 2 characters).');
  }
  if (!isValidEmail(email)) {
    throw new Error('VALIDATION:Please enter a valid email address.');
  }
  if (password.length < 8) {
    throw new Error('VALIDATION:Password must be at least 8 characters long.');
  }

  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();
  const dbUrl = getConfiguredDatabaseUrl();

  if (dbUrl) {
    await ensureNeonSchemaAndSeed(dbUrl);
    const dup = await queryNeon<{ id: string }>(
      dbUrl,
      `SELECT id FROM "user" WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );
    if (dup.rows[0]) {
      throw new Error('EMAIL_EXISTS');
    }

    if (currentUserId) {
      const curRes = await queryNeon<{ id: string; isAnonymous: boolean; createdAt: string }>(
        dbUrl,
        `SELECT id, "isAnonymous", "createdAt" FROM "user" WHERE id = $1 LIMIT 1`,
        [currentUserId]
      );
      const cur = curRes.rows[0];
      if (cur && cur.isAnonymous) {
        await queryNeon(
          dbUrl,
          `UPDATE "user"
           SET name = $1, email = $2, "passwordHash" = $3, "isAnonymous" = false, "updatedAt" = $4
           WHERE id = $5`,
          [name, email, passwordHash, now, cur.id]
        );
        return {
          id: cur.id,
          name,
          email,
          passwordHash,
          isAnonymous: false,
          createdAt: new Date(cur.createdAt).toISOString(),
        };
      }
    }

    const userId = `usr_${crypto.randomUUID()}`;
    await queryNeon(
      dbUrl,
      `INSERT INTO "user" (id, name, email, "passwordHash", "isAnonymous", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, false, $5, $5)`,
      [userId, name, email, passwordHash, now]
    );
    return {
      id: userId,
      name,
      email,
      passwordHash,
      isAnonymous: false,
      createdAt: now,
    };
  }

  const store = await loadStore();
  for (const existing of Object.values(store.users)) {
    if (existing.email && existing.email.toLowerCase() === email) {
      throw new Error('EMAIL_EXISTS');
    }
  }

  if (currentUserId && store.users[currentUserId]) {
    const cur = normalizeStoredUser(store.users[currentUserId]);
    if (cur.isAnonymous) {
      const upgraded: StoredUser = {
        ...cur,
        name,
        email,
        passwordHash,
        isAnonymous: false,
      };
      store.users[cur.id] = upgraded;
      await persistStore(store);
      return upgraded;
    }
  }

  const newUser: StoredUser = {
    id: `usr_${crypto.randomUUID()}`,
    name,
    email,
    passwordHash,
    isAnonymous: false,
    createdAt: now,
  };
  store.users[newUser.id] = newUser;
  await persistStore(store);
  return newUser;
}

export async function signInUser(
  currentUserId: string | null,
  input: { email?: unknown; password?: unknown }
): Promise<StoredUser> {
  const email = normalizeEmail(input.email);
  const password = typeof input.password === 'string' ? input.password : '';

  if (!isValidEmail(email) || !password) {
    throw new Error('VALIDATION:Please enter both your email and password.');
  }

  const dbUrl = getConfiguredDatabaseUrl();
  if (dbUrl) {
    await ensureNeonSchemaAndSeed(dbUrl);
    const res = await queryNeon<{
      id: string;
      name: string;
      email: string | null;
      passwordHash: string | null;
      isAnonymous: boolean;
      createdAt: string;
    }>(
      dbUrl,
      `SELECT id, name, email, "passwordHash", "isAnonymous", "createdAt"
       FROM "user"
       WHERE LOWER(email) = $1 AND "isAnonymous" = false
       LIMIT 1`,
      [email]
    );
    const found = res.rows[0];
    if (!found || !found.passwordHash || !verifyPassword(password, found.passwordHash)) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Merge anonymous guest attempts into the authenticated account if any exist
    if (currentUserId && currentUserId !== found.id) {
      const curRes = await queryNeon<{ isAnonymous: boolean }>(
        dbUrl,
        `SELECT "isAnonymous" FROM "user" WHERE id = $1 LIMIT 1`,
        [currentUserId]
      );
      if (curRes.rows[0]?.isAnonymous) {
        await queryNeon(
          dbUrl,
          `UPDATE attempts SET "userId" = $1 WHERE "userId" = $2`,
          [found.id, currentUserId]
        );
      }
    }

    return {
      id: found.id,
      name: found.name,
      email: found.email,
      passwordHash: found.passwordHash,
      isAnonymous: false,
      createdAt: new Date(found.createdAt).toISOString(),
    };
  }

  const store = await loadStore();
  let matched: StoredUser | null = null;
  for (const rawUser of Object.values(store.users)) {
    const u = normalizeStoredUser(rawUser);
    if (!u.isAnonymous && u.email && u.email.toLowerCase() === email) {
      matched = u;
      break;
    }
  }

  if (!matched || !matched.passwordHash || !verifyPassword(password, matched.passwordHash)) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Merge anonymous guest attempts from current browser session
  if (currentUserId && currentUserId !== matched.id && store.users[currentUserId]) {
    const cur = normalizeStoredUser(store.users[currentUserId]);
    if (cur.isAnonymous) {
      for (const att of Object.values(store.attempts)) {
        if (att.userId === cur.id) {
          att.userId = matched.id;
        }
      }
      await persistStore(store);
    }
  }

  return matched;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickSkillQuestions(
  skill: 'vocabulary' | 'grammar',
  seenIds: Set<string>
): QuestionRecord[] {
  const pool = QUESTIONS.filter((q) => q.skill === skill);
  const targetCounts: Record<Difficulty, number> = {
    1: Math.random() < 0.5 ? 2 : 1,
    2: 2,
    3: 0,
  };
  targetCounts[3] = 5 - targetCounts[1] - targetCounts[2];

  const chosen: QuestionRecord[] = [];
  for (const diff of [1, 2, 3] as Difficulty[]) {
    const candidates = pool.filter((q) => q.difficulty === diff);
    const unseen = shuffle(candidates.filter((q) => !seenIds.has(q.id)));
    const seen = shuffle(candidates.filter((q) => seenIds.has(q.id)));
    const ordered = [...unseen, ...seen];
    for (const q of ordered) {
      if (chosen.filter((c) => c.difficulty === diff).length >= targetCounts[diff]) break;
      chosen.push(q);
    }
  }

  return chosen.sort((a, b) => a.difficulty - b.difficulty);
}

function pickReadingQuestions(seenIds: Set<string>): QuestionRecord[] {
  const readingPool = QUESTIONS.filter((q) => q.skill === 'reading');
  const byPassage = new Map<string, QuestionRecord[]>();
  for (const q of readingPool) {
    if (!q.passageId) continue;
    const list = byPassage.get(q.passageId) ?? [];
    list.push(q);
    byPassage.set(q.passageId, list);
  }

  const passagesRanked = shuffle(Array.from(byPassage.entries())).sort((a, b) => {
    const unseenA = a[1].filter((q) => !seenIds.has(q.id)).length;
    const unseenB = b[1].filter((q) => !seenIds.has(q.id)).length;
    return unseenB - unseenA;
  });

  const selected: QuestionRecord[] = [];
  for (const [, questions] of passagesRanked) {
    if (selected.length >= 5) break;
    const unseen = shuffle(questions.filter((q) => !seenIds.has(q.id)));
    const seen = shuffle(questions.filter((q) => seenIds.has(q.id)));
    const sorted = [...unseen, ...seen].sort((a, b) => a.difficulty - b.difficulty);
    const needed = 5 - selected.length;
    selected.push(...sorted.slice(0, needed));
  }

  return selected;
}

export function toPublicQuestions(questionIds: string[]): PublicQuestion[] {
  return questionIds.map((id, index) => {
    const q = QUESTION_MAP.get(id);
    if (!q) {
      throw new Error(`Unknown question ID: ${id}`);
    }
    const passage = q.passageId ? PASSAGE_MAP.get(q.passageId) : undefined;
    return {
      id: q.id,
      orderIndex: index,
      skill: q.skill,
      difficulty: q.difficulty,
      topic: q.topic,
      prompt: q.prompt,
      options: q.options,
      ...(passage ? { passage } : {}),
    };
  });
}

export async function listUserAttempts(userId: string): Promise<AttemptHistoryItem[]> {
  const dbUrl = getConfiguredDatabaseUrl();
  if (dbUrl) {
    await ensureNeonSchemaAndSeed(dbUrl);
    const res = await queryNeon<{
      id: string;
      status: 'in_progress' | 'completed';
      createdAt: string;
      completedAt: string | null;
      summary: AttemptResultSummary | null;
    }>(
      dbUrl,
      `SELECT id, status, "createdAt", "completedAt", summary
       FROM attempts
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC`,
      [userId]
    );
    return res.rows.map((a) => ({
      attemptId: a.id,
      status: a.status,
      createdAt: new Date(a.createdAt).toISOString(),
      completedAt: a.completedAt ? new Date(a.completedAt).toISOString() : null,
      overallScore: a.summary ? a.summary.overallScore : null,
      verdict: a.summary ? a.summary.verdict : null,
    }));
  }

  const store = await loadStore();
  return Object.values(store.attempts)
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((a) => ({
      attemptId: a.id,
      status: a.status,
      createdAt: a.createdAt,
      completedAt: a.completedAt,
      overallScore: a.summary ? a.summary.overallScore : null,
      verdict: a.summary ? a.summary.verdict : null,
    }));
}

export async function createAttemptForUser(userId: string): Promise<{
  attemptId: string;
  questions: PublicQuestion[];
}> {
  const dbUrl = getConfiguredDatabaseUrl();
  const seenIds = new Set<string>();

  if (dbUrl) {
    await ensureNeonSchemaAndSeed(dbUrl);
    const prevRes = await queryNeon<{ questionIds: string[] }>(
      dbUrl,
      `SELECT "questionIds" FROM attempts WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 2`,
      [userId]
    );
    for (const row of prevRes.rows) {
      if (Array.isArray(row.questionIds)) {
        for (const qId of row.questionIds) seenIds.add(qId);
      }
    }

    const combined = [
      ...pickSkillQuestions('vocabulary', seenIds),
      ...pickSkillQuestions('grammar', seenIds),
      ...pickReadingQuestions(seenIds),
    ];
    const questionIds = combined.map((q) => q.id);
    const attemptId = `att_${crypto.randomUUID().slice(0, 12)}`;
    const now = new Date().toISOString();

    await queryNeon(
      dbUrl,
      `INSERT INTO attempts (id, "userId", status, "questionIds", "createdAt")
       VALUES ($1, $2, 'in_progress', $3::jsonb, $4)`,
      [attemptId, userId, JSON.stringify(questionIds), now]
    );

    return {
      attemptId,
      questions: toPublicQuestions(questionIds),
    };
  }

  const store = await loadStore();
  const recentAttempts = Object.values(store.attempts)
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  for (const prev of recentAttempts) {
    for (const qId of prev.questionIds) {
      seenIds.add(qId);
    }
  }

  const vocab = pickSkillQuestions('vocabulary', seenIds);
  const grammar = pickSkillQuestions('grammar', seenIds);
  const reading = pickReadingQuestions(seenIds);
  const combined = [...vocab, ...grammar, ...reading];

  const attemptId = `att_${crypto.randomUUID().slice(0, 12)}`;
  const attempt: StoredAttempt = {
    id: attemptId,
    userId,
    status: 'in_progress',
    questionIds: combined.map((q) => q.id),
    createdAt: new Date().toISOString(),
    completedAt: null,
    answers: [],
    summary: null,
  };

  store.attempts[attemptId] = attempt;
  await persistStore(store);

  return {
    attemptId,
    questions: toPublicQuestions(attempt.questionIds),
  };
}

export async function getAttemptForUser(
  attemptId: string,
  userId: string
): Promise<StoredAttempt | null> {
  const dbUrl = getConfiguredDatabaseUrl();
  if (dbUrl) {
    await ensureNeonSchemaAndSeed(dbUrl);
    const res = await queryNeon<{
      id: string;
      userId: string;
      status: 'in_progress' | 'completed';
      questionIds: string[];
      createdAt: string;
      completedAt: string | null;
      summary: AttemptResultSummary | null;
    }>(
      dbUrl,
      `SELECT id, "userId", status, "questionIds", "createdAt", "completedAt", summary
       FROM attempts
       WHERE id = $1 AND "userId" = $2
       LIMIT 1`,
      [attemptId, userId]
    );
    const row = res.rows[0];
    if (!row) return null;

    const ansRes = await queryNeon<StoredAttemptAnswer>(
      dbUrl,
      `SELECT "questionId", "selectedIndex", "correctIndex", "isCorrect"
       FROM attempt_answers
       WHERE "attemptId" = $1`,
      [attemptId]
    );

    return {
      id: row.id,
      userId: row.userId,
      status: row.status,
      questionIds: row.questionIds,
      createdAt: new Date(row.createdAt).toISOString(),
      completedAt: row.completedAt ? new Date(row.completedAt).toISOString() : null,
      answers: ansRes.rows,
      summary: row.summary,
    };
  }

  const store = await loadStore();
  const attempt = store.attempts[attemptId];
  if (!attempt || attempt.userId !== userId) return null;
  return attempt;
}

export async function submitAttemptForUser(
  attemptId: string,
  userId: string,
  answersInput: Array<{ questionId: string; selectedIndex: number }>
): Promise<AttemptResultSummary> {
  const dbUrl = getConfiguredDatabaseUrl();
  if (dbUrl) {
    const attempt = await getAttemptForUser(attemptId, userId);
    if (!attempt) {
      throw new Error('NOT_FOUND');
    }
    if (attempt.status === 'completed' && attempt.summary) {
      return attempt.summary;
    }

    const answerMap = new Map<string, number>();
    for (const item of answersInput) {
      if (
        typeof item.questionId === 'string' &&
        Number.isInteger(item.selectedIndex) &&
        item.selectedIndex >= 0 &&
        item.selectedIndex <= 3
      ) {
        answerMap.set(item.questionId, item.selectedIndex);
      }
    }

    if (answerMap.size !== attempt.questionIds.length) {
      throw new Error('INCOMPLETE_ANSWERS');
    }

    const gradedInputs: Array<{ question: QuestionRecord; selectedIndex: number }> = [];
    const storedAnswers: StoredAttemptAnswer[] = [];

    for (const qId of attempt.questionIds) {
      const selectedIndex = answerMap.get(qId);
      const question = QUESTION_MAP.get(qId);
      if (selectedIndex === undefined || !question) {
        throw new Error('INVALID_QUESTION_SET');
      }
      gradedInputs.push({ question, selectedIndex });
      storedAnswers.push({
        questionId: qId,
        selectedIndex,
        correctIndex: question.correctIndex,
        isCorrect: selectedIndex === question.correctIndex,
      });
    }

    const computed = computeReadiness(gradedInputs);
    const completedAt = new Date().toISOString();

    const summary: AttemptResultSummary = {
      attemptId: attempt.id,
      status: 'completed',
      createdAt: attempt.createdAt,
      completedAt,
      overallScore: computed.overallScore,
      verdict: computed.verdict,
      totalCorrect: computed.totalCorrect,
      totalQuestions: computed.totalQuestions,
      skills: computed.skills,
      priorities: computed.priorities,
      speakingListeningReminder: computed.speakingListeningReminder,
    };

    for (const ans of storedAnswers) {
      await queryNeon(
        dbUrl,
        `INSERT INTO attempt_answers (id, "attemptId", "questionId", "selectedIndex", "correctIndex", "isCorrect")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `ans_${crypto.randomUUID().slice(0, 12)}`,
          attempt.id,
          ans.questionId,
          ans.selectedIndex,
          ans.correctIndex,
          ans.isCorrect,
        ]
      );
    }

    await queryNeon(
      dbUrl,
      `UPDATE attempts
       SET status = 'completed', "completedAt" = $1, summary = $2::jsonb
       WHERE id = $3 AND "userId" = $4`,
      [completedAt, JSON.stringify(summary), attempt.id, userId]
    );

    return summary;
  }

  const store = await loadStore();
  const attempt = store.attempts[attemptId];
  if (!attempt || attempt.userId !== userId) {
    throw new Error('NOT_FOUND');
  }
  if (attempt.status === 'completed' && attempt.summary) {
    return attempt.summary;
  }

  const answerMap = new Map<string, number>();
  for (const item of answersInput) {
    if (
      typeof item.questionId === 'string' &&
      Number.isInteger(item.selectedIndex) &&
      item.selectedIndex >= 0 &&
      item.selectedIndex <= 3
    ) {
      answerMap.set(item.questionId, item.selectedIndex);
    }
  }

  if (answerMap.size !== attempt.questionIds.length) {
    throw new Error('INCOMPLETE_ANSWERS');
  }

  const gradedInputs: Array<{ question: QuestionRecord; selectedIndex: number }> = [];
  const storedAnswers: StoredAttemptAnswer[] = [];

  for (const qId of attempt.questionIds) {
    const selectedIndex = answerMap.get(qId);
    const question = QUESTION_MAP.get(qId);
    if (selectedIndex === undefined || !question) {
      throw new Error('INVALID_QUESTION_SET');
    }
    gradedInputs.push({ question, selectedIndex });
    storedAnswers.push({
      questionId: qId,
      selectedIndex,
      correctIndex: question.correctIndex,
      isCorrect: selectedIndex === question.correctIndex,
    });
  }

  const computed = computeReadiness(gradedInputs);
  const completedAt = new Date().toISOString();

  const summary: AttemptResultSummary = {
    attemptId: attempt.id,
    status: 'completed',
    createdAt: attempt.createdAt,
    completedAt,
    overallScore: computed.overallScore,
    verdict: computed.verdict,
    totalCorrect: computed.totalCorrect,
    totalQuestions: computed.totalQuestions,
    skills: computed.skills,
    priorities: computed.priorities,
    speakingListeningReminder: computed.speakingListeningReminder,
  };

  attempt.status = 'completed';
  attempt.completedAt = completedAt;
  attempt.answers = storedAnswers;
  attempt.summary = summary;

  await persistStore(store);
  return summary;
}

export async function getAttemptReviewForUser(
  attemptId: string,
  userId: string
): Promise<AttemptReviewResponse | null> {
  const attempt = await getAttemptForUser(attemptId, userId);
  if (!attempt || attempt.status !== 'completed' || !attempt.summary) {
    return null;
  }

  const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const items: ReviewQuestionItem[] = attempt.questionIds.map((qId, index) => {
    const q = QUESTION_MAP.get(qId)!;
    const ans = answerByQuestion.get(qId)!;
    const passage = q.passageId ? PASSAGE_MAP.get(q.passageId) : undefined;

    return {
      questionId: q.id,
      orderIndex: index,
      skill: q.skill as Skill,
      difficulty: q.difficulty,
      topic: q.topic,
      prompt: q.prompt,
      options: q.options,
      selectedIndex: ans.selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect: ans.isCorrect,
      explanation: q.explanation,
      ...(passage ? { passage } : {}),
    };
  });

  return {
    summary: attempt.summary,
    items,
  };
}
