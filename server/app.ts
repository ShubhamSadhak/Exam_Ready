import express, { type NextFunction, type Request, type Response } from 'express';
import {
  createAttemptForUser,
  createFreshGuestUser,
  ensureGuestUser,
  getAttemptForUser,
  getAttemptReviewForUser,
  listUserAttempts,
  signInUser,
  signSessionToken,
  signUpUser,
  type StoredUser,
  submitAttemptForUser,
  toAuthUser,
  toPublicQuestions,
  verifySessionToken,
} from './store.ts';

const COOKIE_NAME = 'examready_sid';
const SESSION_HEADER = 'x-examready-session';

interface SessionRequest extends Request {
  guestUserId?: string;
  authUser?: StoredUser;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key) {
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

function setSessionCookie(req: Request, res: Response, signedToken: string): void {
  const isHttps =
    req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(signedToken)}`,
    'Path=/',
    'HttpOnly',
    'Max-Age=2592000',
  ];
  if (isHttps) {
    parts.push('SameSite=None', 'Secure', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

async function resolveGuestSession(
  req: SessionRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const headerToken =
      typeof req.headers[SESSION_HEADER] === 'string'
        ? req.headers[SESSION_HEADER]
        : undefined;

    const verifiedCookieId = await verifySessionToken(cookies[COOKIE_NAME]);
    const verifiedHeaderId = verifiedCookieId
      ? null
      : await verifySessionToken(headerToken);

    const candidateId = verifiedCookieId ?? verifiedHeaderId;
    const user = await ensureGuestUser(candidateId);
    const signed = await signSessionToken(user.id);

    if (!verifiedCookieId || verifiedCookieId !== user.id) {
      setSessionCookie(req, res, signed);
    }
    res.setHeader('X-ExamReady-Session', signed);
    req.guestUserId = user.id;
    req.authUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function createApiApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  const handleGetSession = async (req: SessionRequest, res: Response) => {
    try {
      const userId = req.guestUserId!;
      const attempts = await listUserAttempts(userId);
      res.json({
        userId,
        user: toAuthUser(req.authUser!),
        attempts,
      });
    } catch (err) {
      console.error('Failed to get session:', err);
      res.status(500).json({ error: 'Unable to load session' });
    }
  };

  app.get('/api/auth/session', resolveGuestSession, handleGetSession);
  app.get('/api/auth/get-session', resolveGuestSession, handleGetSession);
  app.post('/api/auth/guest', resolveGuestSession, handleGetSession);
  app.post('/api/auth/sign-in/anonymous', resolveGuestSession, handleGetSession);

  const handleSignUp = async (req: SessionRequest, res: Response) => {
    try {
      const user = await signUpUser(req.guestUserId ?? null, {
        name: req.body?.name,
        email: req.body?.email,
        password: req.body?.password,
      });
      const signed = await signSessionToken(user.id);
      setSessionCookie(req, res, signed);
      res.setHeader('X-ExamReady-Session', signed);
      const attempts = await listUserAttempts(user.id);
      res.status(201).json({
        userId: user.id,
        user: toAuthUser(user),
        attempts,
      });
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('VALIDATION:')) {
        res.status(400).json({ error: err.message.slice('VALIDATION:'.length) });
        return;
      }
      if (err instanceof Error && err.message === 'EMAIL_EXISTS') {
        res.status(409).json({
          error: 'An account with this email already exists. Please sign in instead.',
        });
        return;
      }
      console.error('Sign up failed:', err);
      res.status(500).json({ error: 'Unable to create account right now.' });
    }
  };

  app.post('/api/auth/sign-up', resolveGuestSession, handleSignUp);
  app.post('/api/auth/sign-up/email', resolveGuestSession, handleSignUp);

  const handleSignIn = async (req: SessionRequest, res: Response) => {
    try {
      const user = await signInUser(req.guestUserId ?? null, {
        email: req.body?.email,
        password: req.body?.password,
      });
      const signed = await signSessionToken(user.id);
      setSessionCookie(req, res, signed);
      res.setHeader('X-ExamReady-Session', signed);
      const attempts = await listUserAttempts(user.id);
      res.json({
        userId: user.id,
        user: toAuthUser(user),
        attempts,
      });
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('VALIDATION:')) {
        res.status(400).json({ error: err.message.slice('VALIDATION:'.length) });
        return;
      }
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ error: 'Incorrect email or password.' });
        return;
      }
      console.error('Sign in failed:', err);
      res.status(500).json({ error: 'Unable to sign in right now.' });
    }
  };

  app.post('/api/auth/sign-in', resolveGuestSession, handleSignIn);
  app.post('/api/auth/sign-in/email', resolveGuestSession, handleSignIn);

  app.post('/api/auth/sign-out', async (req: Request, res: Response) => {
    try {
      const freshGuest = await createFreshGuestUser();
      const signed = await signSessionToken(freshGuest.id);
      setSessionCookie(req, res, signed);
      res.setHeader('X-ExamReady-Session', signed);
      res.json({
        userId: freshGuest.id,
        user: toAuthUser(freshGuest),
        attempts: [],
      });
    } catch (err) {
      console.error('Sign out failed:', err);
      res.status(500).json({ error: 'Unable to sign out right now.' });
    }
  });

  app.post('/api/attempts', resolveGuestSession, async (req: SessionRequest, res: Response) => {
    try {
      const userId = req.guestUserId!;
      const created = await createAttemptForUser(userId);
      res.status(201).json(created);
    } catch (err) {
      console.error('Failed to create attempt:', err);
      res.status(500).json({ error: 'Failed to create readiness check attempt' });
    }
  });

  app.get('/api/attempts', resolveGuestSession, async (req: SessionRequest, res: Response) => {
    try {
      const userId = req.guestUserId!;
      const attempts = await listUserAttempts(userId);
      res.json({ attempts });
    } catch (err) {
      console.error('Failed to list attempts:', err);
      res.status(500).json({ error: 'Failed to load attempt history' });
    }
  });

  app.get('/api/attempts/:id', resolveGuestSession, async (req: SessionRequest, res: Response) => {
    try {
      const userId = req.guestUserId!;
      const attempt = await getAttemptForUser(req.params.id, userId);
      if (!attempt) {
        res.status(404).json({ error: 'Assessment attempt not found' });
        return;
      }
      if (attempt.status === 'completed' && attempt.summary) {
        res.json({ status: 'completed', summary: attempt.summary });
        return;
      }
      res.json({
        status: 'in_progress',
        attemptId: attempt.id,
        questions: toPublicQuestions(attempt.questionIds),
      });
    } catch (err) {
      console.error('Failed to fetch attempt:', err);
      res.status(500).json({ error: 'Failed to fetch attempt' });
    }
  });

  app.post(
    '/api/attempts/:id/submit',
    resolveGuestSession,
    async (req: SessionRequest, res: Response) => {
      try {
        const userId = req.guestUserId!;
        const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
        const summary = await submitAttemptForUser(req.params.id, userId, answers);
        res.json({ summary });
      } catch (err) {
        if (err instanceof Error && err.message === 'NOT_FOUND') {
          res.status(404).json({ error: 'Assessment attempt not found' });
          return;
        }
        if (
          err instanceof Error &&
          (err.message === 'INCOMPLETE_ANSWERS' || err.message === 'INVALID_QUESTION_SET')
        ) {
          res.status(400).json({ error: 'Please answer all 15 questions before submitting.' });
          return;
        }
        console.error('Failed to submit attempt:', err);
        res.status(500).json({ error: 'Failed to grade assessment' });
      }
    }
  );

  app.get(
    '/api/attempts/:id/review',
    resolveGuestSession,
    async (req: SessionRequest, res: Response) => {
      try {
        const userId = req.guestUserId!;
        const review = await getAttemptReviewForUser(req.params.id, userId);
        if (!review) {
          res.status(404).json({ error: 'Completed review not found for this attempt' });
          return;
        }
        res.json(review);
      } catch (err) {
        console.error('Failed to load review:', err);
        res.status(500).json({ error: 'Failed to load answer review' });
      }
    }
  );

  return app;
}
