import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Award, CreditCard as CreditCardIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Alpha Card</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/auth")}
                  className="text-foreground"
                >
                  Log in
                </Button>
                <Button 
                  onClick={() => navigate("/auth")}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Use your credit cards
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                to their full potential
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Smart tools and AI guidance to help you make the most of every credit card feature—from rewards to payments to spending decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 text-base group"
              >
                Get started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-border"
              >
                Learn more
              </Button>
            </div>
          </div>

          {/* Hero Card Visual */}
          <div className="mt-16 max-w-md mx-auto animate-scale-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 blur-3xl" />
              <div className="relative bg-gradient-to-br from-accent via-primary to-accent rounded-3xl p-8 shadow-elevated">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <div className="text-background/80 text-sm mb-1">Total Balance</div>
                    <div className="text-4xl font-bold text-background">$24,856.43</div>
                  </div>
                  <div className="w-12 h-12 bg-background/20 backdrop-blur rounded-full flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-background" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-background/80 text-xs">Card Number</div>
                  <div className="text-background text-lg font-mono tracking-wider">•••• •••• •••• 4242</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Master every feature of your cards
            </h3>
            <p className="text-muted-foreground text-lg">
              Intelligent tools that help you use your credit cards efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-card animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Smart Card Selection</h4>
              <p className="text-muted-foreground">
                AI-powered recommendations show you the best card for each purchase based on rewards, utilization, and offers.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Smart Purchase Assessment</h4>
              <p className="text-muted-foreground">
                AI-powered guidance on whether to buy now or wait, with personalized financial impact analysis.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border shadow-card animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Complete Usage Analytics</h4>
              <p className="text-muted-foreground">
                Track rewards, spending, utilization, payments, and opportunities across all your cards in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-accent via-primary to-accent rounded-3xl p-12 md:p-16 shadow-elevated animate-scale-in">
            <h3 className="text-3xl md:text-5xl font-bold text-background mb-6">
              Stop underusing your credit cards
            </h3>
            <p className="text-background/90 text-lg mb-8 max-w-2xl mx-auto">
              Start using every feature efficiently with smart guidance and AI-powered insights.
            </p>
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="bg-background text-foreground hover:bg-background/90 h-12 px-8 text-base"
            >
              Get started free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground text-sm">
              © 2025 Alpha Card. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Privacy</button>
              <button className="hover:text-foreground transition-colors">Terms</button>
              <button className="hover:text-foreground transition-colors">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
