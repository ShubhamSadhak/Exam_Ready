import type {
  AttemptHistoryItem,
  AttemptResultSummary,
  AttemptReviewResponse,
  PublicQuestion,
  SessionInfo,
} from '../../shared/types.ts';

const SESSION_STORAGE_KEY = 'examready_guest_token';
let inMemorySessionToken: string | null = null;

function getStoredSessionToken(): string | null {
  if (inMemorySessionToken) return inMemorySessionToken;
  try {
    const fromSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (fromSession) {
      inMemorySessionToken = fromSession;
      return fromSession;
    }
    const fromLocal = localStorage.getItem(SESSION_STORAGE_KEY);
    if (fromLocal) {
      inMemorySessionToken = fromLocal;
      return fromLocal;
    }
  } catch {
    // Storage may be restricted inside strict privacy iframes
  }
  return null;
}

function saveSessionToken(token: string | null): void {
  if (!token) return;
  inMemorySessionToken = token;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getStoredSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['X-ExamReady-Session'] = token;
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  const returnedToken = res.headers.get('X-ExamReady-Session');
  if (returnedToken) {
    saveSessionToken(returnedToken);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export function fetchSession(): Promise<SessionInfo> {
  return requestJson<SessionInfo>('/api/auth/session');
}

export function signUp(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionInfo> {
  return requestJson<SessionInfo>('/api/auth/sign-up', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function signIn(input: {
  email: string;
  password: string;
}): Promise<SessionInfo> {
  return requestJson<SessionInfo>('/api/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function signOut(): Promise<SessionInfo> {
  inMemorySessionToken = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
  return requestJson<SessionInfo>('/api/auth/sign-out', {
    method: 'POST',
  });
}

export function createAttempt(): Promise<{
  attemptId: string;
  questions: PublicQuestion[];
}> {
  return requestJson<{ attemptId: string; questions: PublicQuestion[] }>(
    '/api/attempts',
    { method: 'POST' }
  );
}

export function fetchAttempts(): Promise<{ attempts: AttemptHistoryItem[] }> {
  return requestJson<{ attempts: AttemptHistoryItem[] }>('/api/attempts');
}

export function fetchAttempt(attemptId: string): Promise<
  | { status: 'completed'; summary: AttemptResultSummary }
  | { status: 'in_progress'; attemptId: string; questions: PublicQuestion[] }
> {
  return requestJson(`/api/attempts/${encodeURIComponent(attemptId)}`);
}

export function submitAttempt(
  attemptId: string,
  answers: Array<{ questionId: string; selectedIndex: number }>
): Promise<{ summary: AttemptResultSummary }> {
  return requestJson<{ summary: AttemptResultSummary }>(
    `/api/attempts/${encodeURIComponent(attemptId)}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }
  );
}

export function fetchAttemptReview(
  attemptId: string
): Promise<AttemptReviewResponse> {
  return requestJson<AttemptReviewResponse>(
    `/api/attempts/${encodeURIComponent(attemptId)}/review`
  );
}
