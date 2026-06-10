"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { redirectAfterSubmit } from "@/lib/submit-redirect";
import { calcQuestionXP, calcTotalQuizXP, QuizQuestion, QuizAnswer } from "@/lib/quiz-xp";

const TIMER_SECONDS = 60;
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Phase = "ready" | "question" | "submitting" | "review";

export default function QuizForm({
  achievementSlug,
  questions,
}: {
  achievementSlug: string;
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_SECONDS);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [error, setError] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    setTimeRemaining(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (phase === "question" && timeRemaining === 0) {
      submitAnswer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, phase]);

  function submitAnswer() {
    stopTimer();
    const elapsed = TIMER_SECONDS - timeRemaining;
    const answer: QuizAnswer = {
      question_index: questionIndex,
      chosen_index: selectedIndex,
      time_elapsed: elapsed,
    };
    const updatedAnswers = [...answers, answer];
    setAnswers(updatedAnswers);
    setSelectedIndex(null);

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
      startTimer();
    } else {
      // All questions answered — calculate XP and submit to API
      const xp = calcTotalQuizXP(questions, updatedAnswers);
      setTotalXP(xp);
      submitToAPI(updatedAnswers, xp);
    }
  }

  async function submitToAPI(finalAnswers: QuizAnswer[], xp: number) {
    setApiLoading(true);
    setPhase("submitting");

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        achievement_slug: achievementSlug,
        proof_data: { answers: finalAnswers },
      }),
    });
    const body = await res.json();

    setApiLoading(false);

    if (!res.ok) {
      setError(body.error ?? "Something broke. Try again.");
      setPhase("ready");
      return;
    }

    setPhase("review");

    if ((body.newly_unlocked ?? []).length > 0) {
      redirectAfterSubmit(router, body.newly_unlocked);
    }
  }

  function startQuiz() {
    setAnswers([]);
    setQuestionIndex(0);
    setSelectedIndex(null);
    setPhase("question");
    startTimer();
  }

  const currentQuestion = questions[questionIndex];
  const dashOffset = CIRCUMFERENCE * (1 - timeRemaining / TIMER_SECONDS);
  const isLowTime = timeRemaining <= 10;

  // ── Ready ──────────────────────────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <div className="flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <p className="text-white/50 text-sm">
          {questions.length} question{questions.length !== 1 ? "s" : ""} · 60 seconds each · answer faster for more XP
        </p>
        <button
          onClick={startQuiz}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
        >
          Ready to take the quiz
        </button>
      </div>
    );
  }

  // ── Submitting ─────────────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-white/40 text-sm">Saving your answers...</p>
      </div>
    );
  }

  // ── Review ─────────────────────────────────────────────────────────────────
  if (phase === "review") {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-white">+{totalXP} XP</p>
          <p className="text-white/40 text-sm mt-1">Quiz complete</p>
        </div>

        <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
          {questions.map((q, qi) => {
            const answer = answers[qi];
            const unanswered = answer?.chosen_index === null;
            const earned = calcQuestionXP(q, answer);

            return (
              <div key={qi} className="border border-white/15 rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold text-white">
                    {qi + 1}. {q.question}
                  </p>
                  <span className={`ml-3 shrink-0 text-xs font-semibold tabular-nums ${earned > 0 ? "text-green-400" : "text-white/40"}`}>
                    {earned}/{q.xp} XP
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {q.options.map((option, oi) => {
                    const isCorrect = oi === q.correct_index;
                    const wasChosen = oi === answer?.chosen_index;
                    let style = "bg-white/5 border border-white/10 text-white/50";
                    if (isCorrect) style = "bg-green-500/20 text-green-300 border border-green-500/40";
                    else if (wasChosen && !isCorrect) style = "bg-red-500/20 text-red-300 border border-red-500/40";

                    return (
                      <div key={oi} className={`rounded-lg px-3 py-2 text-xs ${style}`}>
                        {option}
                      </div>
                    );
                  })}
                </div>
                {unanswered && <p className="text-xs text-white/30 mt-2">Time ran out</p>}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  // ── Question ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header: question count + timer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40 font-medium">
          Question {questionIndex + 1} of {questions.length}
        </p>

        {/* Circular timer */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <svg width="80" height="80" viewBox="-4 -4 88 88" className="-rotate-90">
            <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r={RADIUS}
              fill="none"
              stroke={isLowTime ? "#ef4444" : "#818cf8"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
            />
          </svg>
          <span className={`absolute text-lg font-bold ${isLowTime ? "text-red-400" : "text-white"}`}>
            {timeRemaining}
          </span>
        </div>
      </div>

      {/* Question text */}
      <p className="text-base font-semibold text-white leading-snug">
        {currentQuestion.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((option, oi) => (
          <button
            key={oi}
            onClick={() => setSelectedIndex(oi)}
            className={`cursor-pointer text-left rounded-xl px-4 py-3 text-sm border transition-all ${
              selectedIndex === oi
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-white/8 border-white/15 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Submit button */}
      <button
        onClick={submitAnswer}
        disabled={selectedIndex === null}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
      >
        Submit answer
      </button>
    </div>
  );
}
