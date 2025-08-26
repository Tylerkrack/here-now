import { cn } from "@/lib/utils";

export type Intent = "dating" | "networking" | "friendship";

interface IntentBadgeProps {
  intent: Intent;
  className?: string;
}

const intentConfig = {
  dating: {
    label: "Dating",
    className: "bg-dating text-dating-foreground"
  },
  networking: {
    label: "Networking", 
    className: "bg-networking text-networking-foreground"
  },
  friendship: {
    label: "Friends",
    className: "bg-friendship text-friendship-foreground"
  }
};

export function IntentBadge({ intent, className }: IntentBadgeProps) {
  const config = intentConfig[intent];
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}