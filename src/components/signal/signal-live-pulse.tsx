"use client";

export function SignalLivePulse() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-[10px] font-bold tracking-[0.15em] text-emerald-400 uppercase">
        Live
      </span>
    </span>
  );
}
