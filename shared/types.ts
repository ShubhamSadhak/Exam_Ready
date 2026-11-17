export type Skill = 'vocabulary' | 'grammar' | 'reading';

export type Difficulty = 1 | 2 | 3;

export type ReadinessVerdict = 'Ready to book' | 'Almost there' | 'Not yet';

export interface Passage {
  id: string;
  title: string;
  context: string;
  body: string;
}

export interface QuestionRecord {
  id: string;
  skill: Skill;
  difficulty: Difficulty;
  topic: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  passageId?: string;
}

export interface PublicQuestion {
  id: string;
  orderIndex: number;
  skill: Skill;
  difficulty: Difficulty;
  topic: string;
  prompt: string;
  options: [string, string, string, string];
  passage?: Passage;
}

export interface SkillBreakdown {
  skill: Skill;
  label: string;
  weightPercent: number;
  score: number;
  correctCount: number;
  totalCount: number;
  earnedPoints: number;
  availablePoints: number;
  meetsReadyMinimum: boolean;
}

export interface PracticePriority {
  skill: Skill;
  label: string;
  score: number;
  urgency: 'high' | 'medium' | 'maintain';
  headline: string;
  guidance: string;
  missedTopics: string[];
}

export interface AttemptResultSummary {
  attemptId: string;
  status: 'in_progress' | 'completed';
  createdAt: string;
  completedAt: string | null;
  overallScore: number;
  verdict: ReadinessVerdict;
  totalCorrect: number;
  totalQuestions: number;
  skills: SkillBreakdown[];
  priorities: PracticePriority[];
  speakingListeningReminder: string;
}

export interface ReviewQuestionItem {
  questionId: string;
  orderIndex: number;
  skill: Skill;
  difficulty: Difficulty;
  topic: string;
  prompt: string;
  options: [string, string, string, string];
  selectedIndex: number;
  correctIndex: 0 | 1 | 2 | 3;
  isCorrect: boolean;
  explanation: string;
  passage?: Passage;
}

export interface AttemptReviewResponse {
  summary: AttemptResultSummary;
  items: ReviewQuestionItem[];
}

export interface AttemptHistoryItem {
  attemptId: string;
  status: 'in_progress' | 'completed';
  createdAt: string;
  completedAt: string | null;
  overallScore: number | null;
  verdict: ReadinessVerdict | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  isAnonymous: boolean;
}

export interface SessionInfo {
  userId: string;
  user: AuthUser;
  attempts: AttemptHistoryItem[];
}

