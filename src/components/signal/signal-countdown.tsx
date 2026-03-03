"use client";

import * as React from "react";
import { Clock } from "lucide-react";

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
    }, 60_000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (remaining.expired) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="size-3.5" />
        Voting closed
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Clock className="size-3.5" />
      {remaining.days > 0 && `${remaining.days}d `}
      {remaining.hours}h remaining
    </p>
  );
}

function getRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours, expired: false };
}
