import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Plus, TrendingUp, Shield } from "lucide-react";

interface EmptyStateProps {
  onAddCard?: () => void;
}

export const EmptyState = ({ onAddCard }: EmptyStateProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <Card className="shadow-card overflow-hidden">
        <div className="bg-gradient-to-br from-accent via-primary to-accent p-8 text-center">
          <div className="w-16 h-16 bg-background/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-background" />
          </div>
          <h2 className="text-2xl font-bold text-background mb-2">
            Welcome to Alpha Card
          </h2>
          <p className="text-background/90 text-sm">
            Start managing your finances smarter
          </p>
        </div>
        
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Get Started in 3 Easy Steps
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add your first card to unlock all features
          </p>
          
          <Button 
            size="lg"
            onClick={onAddCard}
            className="bg-foreground text-background hover:bg-foreground/90 w-full group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
            Add Your First Card
          </Button>
        </div>
      </Card>

      {/* Features Preview */}
      <div className="grid gap-4">
        <Card className="p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Track Your Spending</h4>
              <p className="text-sm text-muted-foreground">
                Get real-time insights into your spending patterns and stay on budget
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Secure & Protected</h4>
              <p className="text-sm text-muted-foreground">
                Your financial data is encrypted and protected with bank-level security
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Manage Multiple Cards</h4>
              <p className="text-sm text-muted-foreground">
                Keep all your cards in one place and switch between them instantly
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="p-6 shadow-card bg-secondary/30">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Need help getting started?
          </p>
          <Button variant="outline" size="sm">
            View Tutorial
          </Button>
        </div>
      </Card>
    </div>
  );
};
