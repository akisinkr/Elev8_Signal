"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

interface ExchangeFeedbackFormProps {
  matchId: string;
  partnerName: string;
  onComplete: () => void;
}

const QUESTIONS = [
  {
    key: "THE_GIFT",
    en: "What's the single most valuable insight you received?",
    kr: "이 대화에서 받은 가장 가치있는 인사이트는?",
    placeholder: "Share the key takeaway from this conversation...",
  },
  {
    key: "THE_SPARK",
    en: "What surprised you most about this person's superpower?",
    kr: "이 분의 슈퍼파워에서 가장 놀라웠던 점은?",
    placeholder: "What was unexpected or impressive...",
  },
  {
    key: "THE_FORWARD",
    en: "What specific action will you take based on this conversation?",
    kr: "이 대화를 바탕으로 취할 구체적인 액션은?",
    placeholder: "A concrete next step you'll take...",
  },
  {
    key: "THE_COFFEE",
    en: "Would you recommend this person to a friend for a similar conversation?",
    kr: "비슷한 대화를 원하는 지인에게 이 분을 추천하시겠어요?",
    placeholder: "Why or why not...",
    hasToggle: true,
  },
  {
    key: "THE_BRIDGE",
    en: "What superpower of yours did this conversation help you discover or strengthen?",
    kr: "이 대화가 발견하거나 강화해준 당신의 슈퍼파워는?",
    placeholder: "A skill or insight about yourself...",
  },
];

const LABELS = ["The Gift", "The Spark", "The Forward", "The Coffee", "The Bridge"];

export function ExchangeFeedbackForm({ matchId, partnerName, onComplete }: ExchangeFeedbackFormProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [coffeeRecommend, setCoffeeRecommend] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const current = QUESTIONS[currentIdx];
  const isLast = currentIdx === QUESTIONS.length - 1;
  const canProceed = (responses[current.key]?.trim().length ?? 0) > 0 &&
    (current.key !== "THE_COFFEE" || coffeeRecommend !== null);

  const handleNext = async () => {
    if (!canProceed) return;

    if (isLast) {
      setSubmitting(true);
      try {
        // Append coffee toggle to response
        const finalResponses = { ...responses };
        if (coffeeRecommend !== null) {
          finalResponses["THE_COFFEE"] = `${coffeeRecommend ? "Yes" : "No"} — ${finalResponses["THE_COFFEE"] || ""}`;
        }

        const res = await fetch(`/api/matches/${matchId}/exchange-feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: QUESTIONS.map(q => ({
              questionKey: q.key,
              response: finalResponses[q.key] || "",
            })),
            recommend: coffeeRecommend,
          }),
        });

        if (res.ok) {
          setSubmitted(true);
          setTimeout(onComplete, 2000);
        }
      } catch { /* ignore */ }
      setSubmitting(false);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <Check className="size-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white/80">Feedback Submitted</h2>
          <p className="text-white/40 text-sm">Thank you for sharing your experience with {partnerName}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {QUESTIONS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
            i < currentIdx ? "bg-amber-400/50" : i === currentIdx ? "bg-amber-400/30" : "bg-white/[0.06]"
          }`} />
        ))}
      </div>

      {/* Question Label */}
      <div className="mb-2">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-400/60 uppercase">
          {LABELS[currentIdx]}
        </span>
        <span className="text-[10px] text-white/20 ml-2">{currentIdx + 1} of {QUESTIONS.length}</span>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold text-white/80 mb-1">{current.en}</h2>
      <p className="text-xs text-white/30 mb-6">{current.kr}</p>

      {/* Coffee Toggle */}
      {current.hasToggle && (
        <div className="flex gap-3 mb-4">
          <button onClick={() => setCoffeeRecommend(true)}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
              coffeeRecommend === true
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/[0.08] bg-white/[0.02] text-white/40 hover:border-white/[0.15]"
            }`}>
            Yes, absolutely
          </button>
          <button onClick={() => setCoffeeRecommend(false)}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
              coffeeRecommend === false
                ? "border-red-400/30 bg-red-400/10 text-red-300"
                : "border-white/[0.08] bg-white/[0.02] text-white/40 hover:border-white/[0.15]"
            }`}>
            Not this time
          </button>
        </div>
      )}

      {/* Response */}
      <textarea
        value={responses[current.key] || ""}
        onChange={(e) => setResponses(prev => ({ ...prev, [current.key]: e.target.value }))}
        placeholder={current.placeholder}
        rows={4}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-amber-400/30 resize-none"
      />

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {currentIdx > 0 && (
          <button onClick={() => setCurrentIdx(prev => prev - 1)}
            className="px-4 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/50 transition-colors">
            Back
          </button>
        )}
        <button onClick={handleNext} disabled={!canProceed || submitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-medium disabled:opacity-30 transition-colors">
          {submitting ? "Submitting..." : isLast ? "Submit Feedback" : "Next"}
          {!isLast && <ArrowRight className="size-4" />}
        </button>
      </div>
    </div>
  );
}
