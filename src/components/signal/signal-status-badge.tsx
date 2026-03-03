import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SignalStatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  string,
  { variant: "default" | "secondary" | "outline"; className?: string }
> = {
  DRAFT: { variant: "secondary" },
  LIVE: { variant: "default" },
  CLOSED: { variant: "outline" },
  PUBLISHED: { variant: "secondary", className: "bg-green-500/15 text-green-400 border-green-500/20" },
};

export function SignalStatusBadge({ status }: SignalStatusBadgeProps) {
  const config = statusConfig[status] ?? { variant: "outline" as const };

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {status}
    </Badge>
  );
}
