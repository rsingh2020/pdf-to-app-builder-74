import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Chrome, Apple } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "You can now log in with your credentials.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Alpha Card</h1>
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            {isLogin ? "Log in" : "Create your account"}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4 animate-scale-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          {/* OAuth Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-accent/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              <Chrome className="h-4 w-4" />
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-accent/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              <Apple className="h-4 w-4" />
              <span className="text-sm font-medium">Continue with Apple</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="px-2 py-2 rounded-xl border border-border text-muted-foreground text-xs inline-flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> Email
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="flex-1 border-border rounded-xl text-sm h-10"
              />
            </div>

            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="w-full border-border rounded-xl text-sm h-10"
            />

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl h-10 text-sm font-medium mt-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : isLogin ? (
                "Log in"
              ) : (
                "Sign up"
              )}
            </Button>

            <div className="text-[10px] text-muted-foreground text-center">
              Demo only · Data stored securely
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2">
              {isLogin ? (
                <>
                  No account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="underline hover:text-foreground"
                    disabled={loading}
                    type="button"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="underline hover:text-foreground"
                    disabled={loading}
                    type="button"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
