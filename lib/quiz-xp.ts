export type QuizQuestion = {
  question: string;
  options: string[];
  correct_index: number;
  xp: number;
};

export type QuizAnswer = {
  question_index: number;
  chosen_index: number | null;
  time_elapsed: number; // seconds taken to answer (capped at 60)
};

// XP for a single question:
//   - Wrong or unanswered → 0
//   - Answered in ≤20s → full XP
//   - Answered in 20–60s → linear from full XP down to 1
//   - Answered at exactly 60s → 1 XP
export function calcQuestionXP(question: QuizQuestion, answer: QuizAnswer): number {
  if (answer.chosen_index === null || answer.chosen_index !== question.correct_index) return 0;
  const elapsed = Math.min(answer.time_elapsed, 60);
  if (elapsed <= 20) return question.xp;
  return Math.max(1, Math.round(question.xp - (question.xp - 1) * (elapsed - 20) / 40));
}

export function calcTotalQuizXP(questions: QuizQuestion[], answers: QuizAnswer[]): number {
  return answers.reduce((total, answer) => {
    const question = questions[answer.question_index];
    if (!question) return total;
    return total + calcQuestionXP(question, answer);
  }, 0);
}
