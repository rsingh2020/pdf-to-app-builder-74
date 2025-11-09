import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, 
  CreditCard, 
  FileText, 
  Plus,
  Bell,
  Settings
} from "lucide-react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
}

const ActionButton = ({ icon, label, description, onClick }: ActionButtonProps) => (
  <Button
    variant="ghost"
    className="w-full justify-start gap-4 h-auto py-4 px-4 hover:bg-secondary"
    onClick={onClick}
  >
    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent">
      {icon}
    </div>
    <div className="flex-1 text-left">
      <p className="font-medium text-foreground">{label}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  </Button>
);

export const QuickActions = () => {
  return (
    <Card className="shadow-card">
      <div className="p-6 space-y-2">
        <ActionButton 
          icon={<Gift className="h-5 w-5" />}
          label="Offers"
          description="Deals & spend deals"
        />
        <ActionButton 
          icon={<CreditCard className="h-5 w-5" />}
          label="Make Payment"
          description="Pay easy bills"
        />
        <ActionButton 
          icon={<Plus className="h-5 w-5" />}
          label="Add Card or Loan"
        />
        <ActionButton 
          icon={<FileText className="h-5 w-5" />}
          label="AutoFill"
        />
        <ActionButton 
          icon={<Bell className="h-5 w-5" />}
          label="Notifications"
        />
        <ActionButton 
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
        />
      </div>
    </Card>
  );
};
