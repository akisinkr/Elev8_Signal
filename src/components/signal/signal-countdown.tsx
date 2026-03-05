"use client";

import * as React from "react";

interface SignalCountdownProps {
  deadline: string;
}

export function SignalCountdown({ deadline }: SignalCountdownProps) {
  const [remaining, setRemaining] = React.useState(() =>
    getRemaining(deadline)
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining(deadline));
    }, 1_000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (remaining.expired) {
    return (
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          Voting has closed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Segmented countdown */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <TimeSegment value={remaining.days} label="days" />
        <span className="text-xl font-light text-muted-foreground/50 -mt-5">:</span>
        <TimeSegment value={remaining.hours} label="hrs" />
        <span className="text-xl font-light text-muted-foreground/50 -mt-5">:</span>
        <TimeSegment value={remaining.minutes} label="min" />
        {remaining.days === 0 && (
          <>
            <span className="text-xl font-light text-muted-foreground/50 -mt-5">:</span>
            <TimeSegment value={remaining.seconds} label="sec" urgent />
          </>
        )}
      </div>

      {/* Human-readable deadline */}
      <p className="text-xs text-muted-foreground/60 text-center tracking-wide">
        {formatDeadline(deadline)}
      </p>
    </div>
  );
}

function TimeSegment({
  value,
  label,
  urgent = false,
}: {
  value: number;
  label: string;
  urgent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          min-w-[3.25rem] sm:min-w-[4rem] rounded-xl border px-2 py-2.5 sm:py-3 text-center
          ${urgent
            ? "border-destructive/30 bg-destructive/5"
            : "border-border/60 bg-card/50"
          }
        `}
      >
        <span
          className={`
            text-xl sm:text-2xl font-bold tabular-nums tracking-tight
            ${urgent ? "text-destructive" : "text-foreground"}
          `}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1.5 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

function getRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

function formatDeadline(deadline: string) {
  const d = new Date(deadline);
  const day = d.toLocaleDateString("en-US", { weekday: "long" });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `Closes ${day} at ${time}`;
}
