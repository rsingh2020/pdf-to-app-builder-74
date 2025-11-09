import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  level: "unverified" | "basic" | "verified" | "premium";
  showTooltip?: boolean;
}

const levelConfig = {
  unverified: {
    icon: ShieldAlert,
    label: "Unverified",
    color: "bg-muted text-muted-foreground",
    description: "Complete your profile to unlock features",
  },
  basic: {
    icon: Shield,
    label: "Basic",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description: "View dashboard, add cards (limited transactions)",
  },
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    description: "Full access, unlimited transactions",
  },
  premium: {
    icon: Crown,
    label: "Premium",
    color: "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 text-amber-600 border-amber-500/20",
    description: "Priority support, exclusive features, higher limits",
  },
};

export const VerificationBadge = ({ level, showTooltip = true }: VerificationBadgeProps) => {
  const config = levelConfig[level];
  const Icon = config.icon;

  const badge = (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};
