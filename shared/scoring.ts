import type {
  Difficulty,
  PracticePriority,
  QuestionRecord,
  ReadinessVerdict,
  Skill,
  SkillBreakdown,
} from './types.ts';

export const SKILL_WEIGHTS: Record<Skill, number> = {
  vocabulary: 0.3,
  grammar: 0.3,
  reading: 0.4,
};

export const SKILL_LABELS: Record<Skill, string> = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  reading: 'Reading',
};

export const SPEAKING_LISTENING_REMINDER =
  'This is a short readiness estimate focused on reading, vocabulary, and grammar — not an official Goethe or ÖSD result. Be sure to practise Listening (Hören) and Speaking (Sprechen) before booking your exam.';

export function difficultyLabel(difficulty: Difficulty): string {
  if (difficulty === 1) return 'Easy';
  if (difficulty === 2) return 'Medium';
  return 'Hard';
}

export function determineVerdict(
  overallScore: number,
  skillScores: Record<Skill, number>
): ReadinessVerdict {
  const everySkillAtLeast60 =
    skillScores.vocabulary >= 60 &&
    skillScores.grammar >= 60 &&
    skillScores.reading >= 60;

  if (overallScore >= 75 && everySkillAtLeast60) {
    return 'Ready to book';
  }
  if (overallScore >= 60) {
    return 'Almost there';
  }
  return 'Not yet';
}

export interface GradedAnswerInput {
  question: QuestionRecord;
  selectedIndex: number;
}

export interface ComputedReadiness {
  overallScore: number;
  verdict: ReadinessVerdict;
  totalCorrect: number;
  totalQuestions: number;
  skills: SkillBreakdown[];
  priorities: PracticePriority[];
  speakingListeningReminder: string;
}

const SKILL_GUIDANCE: Record<Skill, { weak: string; steady: string }> = {
  vocabulary: {
    weak: 'Focus on high-frequency A1 themes: daily schedules, housing notices, grocery shopping, transport, and polite requests with nouns paired with their articles (der/die/das).',
    steady: 'Keep reinforcing A1 word families and everyday verbs so you can recognize paraphrases quickly under exam timing.',
  },
  grammar: {
    weak: 'Review verb-second (V2) word order, modal verbs (können, müssen, möchten), accusative articles (den/einen), and common prepositions of time and place (am, im, um, mit, nach).',
    steady: 'Maintain accuracy with separable verbs and negation (nicht vs. kein) so grammar slips do not cost easy writing or reading points.',
  },
  reading: {
    weak: 'Practise scanning short German signs, emails, and building notices for exact times, prices, exceptions ("außer", "nur"), and whether a statement is true or false.',
    steady: 'Continue timing yourself on Goethe/ÖSD Lesen Teil 1–3 texts to stay sharp on detail traps and negative phrasing.',
  },
};

export function computeReadiness(graded: GradedAnswerInput[]): ComputedReadiness {
  const orderedSkills: Skill[] = ['vocabulary', 'grammar', 'reading'];
  const skillScores: Record<Skill, number> = {
    vocabulary: 0,
    grammar: 0,
    reading: 0,
  };

  let totalCorrect = 0;
  const missedTopicsBySkill: Record<Skill, string[]> = {
    vocabulary: [],
    grammar: [],
    reading: [],
  };

  const skills: SkillBreakdown[] = orderedSkills.map((skill) => {
    const items = graded.filter((g) => g.question.skill === skill);
    let earnedPoints = 0;
    let availablePoints = 0;
    let correctCount = 0;

    for (const item of items) {
      const weight = item.question.difficulty;
      availablePoints += weight;
      const isCorrect = item.selectedIndex === item.question.correctIndex;
      if (isCorrect) {
        earnedPoints += weight;
        correctCount += 1;
        totalCorrect += 1;
      } else if (!missedTopicsBySkill[skill].includes(item.question.topic)) {
        missedTopicsBySkill[skill].push(item.question.topic);
      }
    }

    const score =
      availablePoints > 0 ? Math.round((earnedPoints / availablePoints) * 100) : 0;
    skillScores[skill] = score;

    return {
      skill,
      label: SKILL_LABELS[skill],
      weightPercent: Math.round(SKILL_WEIGHTS[skill] * 100),
      score,
      correctCount,
      totalCount: items.length,
      earnedPoints,
      availablePoints,
      meetsReadyMinimum: score >= 60,
    };
  });

  const overallScore = Math.round(
    skillScores.vocabulary * SKILL_WEIGHTS.vocabulary +
      skillScores.grammar * SKILL_WEIGHTS.grammar +
      skillScores.reading * SKILL_WEIGHTS.reading
  );

  const verdict = determineVerdict(overallScore, skillScores);

  const sortedSkills = [...skills].sort((a, b) => a.score - b.score);
  const priorities: PracticePriority[] = sortedSkills.map((s) => {
    const missedTopics = missedTopicsBySkill[s.skill];
    let urgency: 'high' | 'medium' | 'maintain' = 'maintain';
    let headline = `${s.label} is exam-ready (${s.score}%)`;
    let guidance = SKILL_GUIDANCE[s.skill].steady;

    if (s.score < 60) {
      urgency = 'high';
      headline = `Priority focus: ${s.label} (${s.score}% — below 60% minimum)`;
      guidance = SKILL_GUIDANCE[s.skill].weak;
    } else if (s.score < 75) {
      urgency = 'medium';
      headline = `Strengthen ${s.label} (${s.score}% — aim for 75%+)`;
      guidance = SKILL_GUIDANCE[s.skill].weak;
    }

    return {
      skill: s.skill,
      label: s.label,
      score: s.score,
      urgency,
      headline,
      guidance,
      missedTopics,
    };
  });

  return {
    overallScore,
    verdict,
    totalCorrect,
    totalQuestions: graded.length,
    skills,
    priorities,
    speakingListeningReminder: SPEAKING_LISTENING_REMINDER,
  };
}
