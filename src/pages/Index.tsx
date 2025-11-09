import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Menu, X, LogOut, Plus, TrendingUp, CreditCard, DollarSign, Calendar } from "lucide-react";
import { AccountSummary } from "@/components/AccountSummary";
import { QuickActions } from "@/components/QuickActions";
import { EmptyState } from "@/components/EmptyState";
import { ProfileSetup } from "@/components/ProfileSetup";
import { AddCardModal } from "@/components/AddCardModal";
import { CardRecommendation } from "@/components/CardRecommendation";
import { PurchaseAssessment } from "@/components/PurchaseAssessment";
import { SpendingInsights } from "@/components/SpendingInsights";
import { PaymentReminders } from "@/components/PaymentReminders";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Index = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Refs for section navigation
  const insightsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const aiToolsRef = useRef<HTMLDivElement>(null);
  const paymentsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      setUser(session.user);

      // Check profile completion
      const { data: verificationData } = await supabase
        .from("verification_status")
        .select("profile_completed")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (verificationData) {
        setProfileCompleted(verificationData.profile_completed);
      }

      // Fetch user cards
      if (verificationData?.profile_completed) {
        const { data: cardsData } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (cardsData) {
          setCards(cardsData);
        }
      }

      setLoading(false);
    };

    initializeUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCards = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setCards(data);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show profile setup if not completed
  if (!profileCompleted) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Alpha Card</h1>
            
            {/* Quick Navigation - Hidden on mobile */}
            {cards.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(insightsRef)}
                  className="text-xs"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Insights
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(aiToolsRef)}
                  className="text-xs"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  AI Tools
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(paymentsRef)}
                  className="text-xs"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Payments
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(cardsRef)}
                  className="text-xs"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  My Cards
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Search className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground"
                onClick={() => setShowMenu(!showMenu)}
              >
                {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {cards.length === 0 ? (
          <div className="max-w-md mx-auto">
            <EmptyState onAddCard={() => setShowAddCard(true)} />
          </div>
        ) : (
          <>
            {/* Spending Insights & Analytics */}
            <div ref={insightsRef} className="animate-fade-in">
              <SpendingInsights />
            </div>

            {/* Account Summary */}
            <div ref={cardsRef} className="animate-fade-in">
              <AccountSummary cards={cards} />
            </div>

            {/* Payment Reminders */}
            <div ref={paymentsRef} className="animate-fade-in">
              <PaymentReminders cards={cards} />
            </div>

            {/* AI-Powered Features */}
            <div ref={aiToolsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              <CardRecommendation />
              <PurchaseAssessment />
            </div>

            {/* Menu Section */}
            {showMenu && (
              <div className="animate-scale-in max-w-md mx-auto">
                <QuickActions />
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Card Modal */}
      <AddCardModal
        open={showAddCard}
        onOpenChange={setShowAddCard}
        onCardAdded={fetchCards}
      />
    </div>
  );
};

export default Index;
