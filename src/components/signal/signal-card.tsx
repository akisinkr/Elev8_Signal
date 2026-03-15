import Link from "next/link";
import { ArrowUpRight, Check, Users } from "lucide-react";

interface SignalCardProps {
  signalNumber: number;
  question: string;
  category: string;
  totalVotes: number;
  topAnswer: string;
  publishedAt: string;
  hasVoted: boolean;
  email?: string;
}

export function SignalCard({
  signalNumber,
  question,
  category,
  totalVotes,
  hasVoted,
  email,
}: SignalCardProps) {
  const href = email
    ? `/signal/${signalNumber}?email=${encodeURIComponent(email)}`
    : `/signal/${signalNumber}`;

  return (
    <Link href={href} className="group block">
      <div
        className={`relative rounded-xl border bg-white/[0.02] px-5 py-4 transition-all duration-300 hover:bg-white/[0.04] ${
          hasVoted
            ? "border-[#C8A84E]/15 hover:border-[#C8A84E]/25"
            : "border-white/[0.06] hover:border-white/[0.12]"
        }`}
      >
        {/* Top row: signal number + voted badge + category */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#C8A84E]/35">
            Signal {signalNumber}
          </span>
          {hasVoted && (
            <span className="flex items-center gap-1 text-[10px] text-[#C8A84E]/50">
              <Check className="size-2.5" /> voted
            </span>
          )}
          <span className="ml-auto text-[10px] tracking-[0.1em] uppercase text-white/20">
            {category}
          </span>
        </div>

        {/* Question + footer in a row */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-[15px] font-light leading-relaxed text-white/80 line-clamp-2 flex-1">
            {question}
          </p>
          <ArrowUpRight className="size-3.5 mt-1 shrink-0 text-white/10 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C8A84E]/50" />
        </div>

        {/* Footer: vote count */}
        <div className="flex items-center gap-1.5 text-white/20 mt-3">
          <Users className="size-3" />
          <span className="text-[11px]">
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </span>
        </div>
      </div>
    </Link>
  );
}
